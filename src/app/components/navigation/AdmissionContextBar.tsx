/**
 * Admission Context Bar
 * 
 * Dedicated bar displayed below patient header when an admission is selected.
 * Shows admission details and provides admission-level navigation.
 */

import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Calendar,
  DollarSign,
  Stethoscope,
  User,
  ShieldCheck,
  ChevronDown,
  Activity,
  FileText,
  ClipboardCheck,
  Pill,
  Target,
  FileSignature,
  Users,
  HeartPulse,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface Admission {
  id: string;
  startDate: string;
  status: 'active' | 'pending' | 'discharged';
  primaryPayer: string;
  disciplines: string[];
  caseManager: string;
  authorizationStatus: 'approved' | 'pending' | 'denied';
}

interface AdmissionContextBarProps {
  admission: Admission;
  availableAdmissions?: Admission[];
  onAdmissionChange?: (admissionId: string) => void;
}

export default function AdmissionContextBar({
  admission,
  availableAdmissions = [],
  onAdmissionChange,
}: AdmissionContextBarProps) {
  const [showAdmissionSelector, setShowAdmissionSelector] = useState(false);

  const statusConfig = {
    active: { color: 'green', label: 'Active' },
    pending: { color: 'amber', label: 'Pending' },
    discharged: { color: 'gray', label: 'Discharged' },
  };

  const authConfig = {
    approved: { color: 'green', label: 'Approved' },
    pending: { color: 'amber', label: 'Pending' },
    denied: { color: 'red', label: 'Denied' },
  };

  const status = statusConfig[admission.status];
  const auth = authConfig[admission.authorizationStatus];

  return (
    <div className="sticky top-[var(--patient-header-height,120px)] z-20 bg-blue-50 border-b border-blue-200">
      <div className="px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Admission Info */}
          <div className="flex items-center gap-6 text-sm">
            {/* Admission Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdmissionSelector(!showAdmissionSelector)}
                className="h-auto py-1"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">Admission: {admission.startDate}</span>
                {availableAdmissions.length > 1 && (
                  <ChevronDown className="w-3 h-3 ml-1" />
                )}
              </Button>

              {/* Admission Dropdown */}
              {showAdmissionSelector && availableAdmissions.length > 1 && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50">
                  {availableAdmissions.map((adm) => (
                    <button
                      key={adm.id}
                      onClick={() => {
                        onAdmissionChange?.(adm.id);
                        setShowAdmissionSelector(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between',
                        adm.id === admission.id && 'bg-blue-50'
                      )}
                    >
                      <span className="text-sm">{adm.startDate}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          statusConfig[adm.status].color === 'green'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : statusConfig[adm.status].color === 'amber'
                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        )}
                      >
                        {statusConfig[adm.status].label}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                status.color === 'green'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : status.color === 'amber'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              )}
            >
              {status.label}
            </Badge>

            {/* Primary Payer */}
            <div className="flex items-center gap-1 text-gray-700">
              <DollarSign className="w-4 h-4" />
              <span>{admission.primaryPayer}</span>
            </div>

            {/* Disciplines */}
            <div className="flex items-center gap-1 text-gray-700">
              <Stethoscope className="w-4 h-4" />
              <span>{admission.disciplines.join(', ')}</span>
            </div>

            {/* Case Manager */}
            <div className="flex items-center gap-1 text-gray-700">
              <User className="w-4 h-4" />
              <span>{admission.caseManager}</span>
            </div>

            {/* Authorization */}
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                auth.color === 'green'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : auth.color === 'amber'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-red-100 text-red-700 border-red-300'
              )}
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              Auth: {auth.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Admission-Level Navigation Tabs */}
      <AdmissionLevelTabs />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMISSION-LEVEL TABS
// ═══════════════════════════════════════════════════════════════════════════

function AdmissionLevelTabs() {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'visits', label: 'Visits', icon: Calendar },
    { id: 'documentation', label: 'Documentation', icon: FileText, badge: 7 },
    { id: 'assessments', label: 'Assessments', icon: ClipboardCheck, badge: 2 },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'care-plans', label: 'Care Plans', icon: Target },
    { id: 'orders', label: 'Orders', icon: FileSignature, badge: 4 },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'care-team', label: 'Care Team', icon: Users },
    { id: 'hospice', label: 'Hospice', icon: HeartPulse },
  ];

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex items-center gap-1 px-6 bg-white overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap',
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                )}
              >
                {tab.badge}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}