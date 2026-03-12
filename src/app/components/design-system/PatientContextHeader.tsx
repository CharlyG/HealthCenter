/**
 * Design System - Patient Context Header
 * Persistent sticky header showing patient summary and quick actions
 * Displays when a patient is selected in the application
 *
 * Features:
 *  - Patient name, DOB/age, MRN, office, admission status
 *  - Payer tags, discipline tags, alert indicator
 *  - Admission switcher dropdown (multiple admissions)
 *  - Quick action buttons: Schedule visit, Start documentation, Upload document, Send message
 */
import React, { useState } from 'react';
import {
  User,
  Calendar,
  Hash,
  Building2,
  Activity,
  FileText,
  Upload,
  MessageSquare,
  CalendarPlus,
  AlertTriangle,
  ChevronDown,
  Stethoscope,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { StatusBadge } from './StatusBadge';
import { calculateAge, formatDate } from '../../lib/utils/dateUtils';

export interface PatientContextData {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  mrn: string;
  office_name?: string;
  status: string;
  phone?: string;
  admission_status?: 'admitted' | 'not_admitted';
  payer_tags?: string[];
  discipline_tags?: string[];
  alert_count?: number;
}

export interface PatientAdmission {
  id: string;
  label: string;
  status: string;
  type?: string;
  soc_date?: string;
}

interface PatientContextHeaderProps {
  patient: PatientContextData;
  admissions?: PatientAdmission[];
  activeAdmissionId?: string;
  onAdmissionChange?: (admissionId: string) => void;
  onQuickAction?: (action: string) => void;
  actions?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'ghost' | 'outline';
  }>;
}

export const PatientContextHeader = React.memo(({
  patient,
  admissions = [],
  activeAdmissionId,
  onAdmissionChange,
  onQuickAction,
  actions = [],
}: PatientContextHeaderProps) => {
  const age = calculateAge(patient.dob);
  const [admDropdownOpen, setAdmDropdownOpen] = useState(false);

  const defaultActions = [
    { id: 'schedule-visit', label: 'Schedule Visit', icon: <CalendarPlus className="size-4" />, variant: 'default' as const },
    { id: 'start-documentation', label: 'Start Doc', icon: <FileText className="size-4" />, variant: 'outline' as const },
    { id: 'upload-document', label: 'Upload', icon: <Upload className="size-4" />, variant: 'outline' as const },
    { id: 'send-message', label: 'Message', icon: <MessageSquare className="size-4" />, variant: 'outline' as const },
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;
  const activeAdmission = admissions.find((a) => a.id === activeAdmissionId);
  const alertCount = patient.alert_count ?? 0;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-full px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Patient Summary */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="flex items-center justify-center size-12 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
              <User className="size-6" />
            </div>

            <div className="flex items-center gap-4 flex-1 min-w-0 flex-wrap">
              {/* Name, Status, Alerts */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {patient.last_name}, {patient.first_name}
                  </h2>
                  <StatusBadge status={patient.status} size="sm" />
                  {patient.admission_status === 'admitted' && (
                    <Badge className="bg-green-100 text-green-700 text-[10px] font-semibold">
                      Admitted
                    </Badge>
                  )}
                  {alertCount > 0 && (
                    <button
                      onClick={() => onQuickAction?.('view-alerts')}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      <AlertTriangle className="size-3.5" />
                      <span className="text-[10px] font-bold">{alertCount}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Patient Details Row */}
              <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-gray-400" />
                  <span className="font-medium">{formatDate(patient.dob)}</span>
                  <span className="text-gray-400">&middot;</span>
                  <span>{age}y</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Hash className="size-4 text-gray-400" />
                  <span className="font-mono font-medium">{patient.mrn}</span>
                </div>

                {patient.office_name && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="size-4 text-gray-400" />
                    <span>{patient.office_name}</span>
                  </div>
                )}

                {/* Payer Tags */}
                {patient.payer_tags && patient.payer_tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Activity className="size-3.5 text-gray-400" />
                    {patient.payer_tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] h-5 px-1.5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Discipline Tags */}
                {patient.discipline_tags && patient.discipline_tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Stethoscope className="size-3.5 text-gray-400" />
                    {patient.discipline_tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="text-[10px] h-5 px-1.5 bg-violet-100 text-violet-700 border-violet-200"
                      >
                        {tag.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Admission Switcher + Quick Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Admission Switcher */}
            {admissions.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setAdmDropdownOpen(!admDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-500">Admission:</span>
                  <span className="text-gray-900 font-semibold truncate max-w-[140px]">
                    {activeAdmission?.label || 'Select'}
                  </span>
                  <ChevronDown className="size-3.5 text-gray-400" />
                </button>
                {admDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-50" onClick={() => setAdmDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg border border-gray-200 shadow-lg min-w-[240px] py-1">
                      {admissions.map((adm) => (
                        <button
                          key={adm.id}
                          onClick={() => {
                            onAdmissionChange?.(adm.id);
                            setAdmDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                            adm.id === activeAdmissionId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className="font-medium">{adm.label}</div>
                          <div className="text-xs text-gray-500">
                            {adm.type || 'Home Health'} &middot; {adm.status}
                            {adm.soc_date && ` &middot; SOC: ${adm.soc_date}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Divider */}
            {admissions.length > 1 && <div className="w-px h-6 bg-gray-200" />}

            {/* Quick Actions */}
            {displayActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => onQuickAction?.(action.id)}
              >
                {action.icon}
                <span className="ml-1.5">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

PatientContextHeader.displayName = 'PatientContextHeader';
