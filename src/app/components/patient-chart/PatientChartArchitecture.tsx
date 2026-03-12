/**
 * Patient Chart Architecture
 * 
 * Two-tier navigation system:
 * - Patient-Level Data: Constant across admissions (Overview, Demographics, Locations)
 * - Admission-Level Workflows: Updates when switching admissions (Visits, Clinical, Orders)
 * 
 * Features:
 * - Clear visual separation between patient and admission data
 * - Admission selector updates admission-level sections automatically
 * - Patient-level sections remain unchanged
 * - Responsive sidebar navigation
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  User,
  MapPin,
  FileText,
  History,
  Briefcase,
  Stethoscope,
  ClipboardCheck,
  Pill,
  Calendar,
  Receipt,
  Users,
  Heart,
  ChevronDown,
  ChevronRight,
  Activity,
  Home,
  AlertCircle,
  Clock,
  TrendingUp,
  Star,
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

export type PatientLevelSection = 
  | 'overview'
  | 'demographics'
  | 'locations'
  | 'patient-documents'
  | 'referral-history';

export type AdmissionLevelSection =
  | 'admission-overview'
  | 'visits'
  | 'clinical-documentation'
  | 'orders'
  | 'assessments'
  | 'scheduling'
  | 'billing'
  | 'care-team'
  | 'hospice';

export type ChartSection = PatientLevelSection | AdmissionLevelSection;

export interface ChartNavigationItem {
  id: ChartSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    value: number | string;
    variant: 'default' | 'success' | 'warning' | 'danger';
  };
  path?: string;
}

export interface PatientChartData {
  patientId: string;
  name: string;
  mrn: string;
  dob: string;
  admissions: AdmissionSummary[];
  selectedAdmissionId?: string;
}

export interface AdmissionSummary {
  admissionId: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'discharged' | 'pending';
  primaryPayer: string;
  type: 'home_health' | 'hospice';
  episodeNumber?: number;
}

// ==================== NAVIGATION CONFIGURATION ====================

export const patientLevelSections: ChartNavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    path: 'overview',
  },
  {
    id: 'demographics',
    label: 'Demographics',
    icon: User,
    path: 'demographics',
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: MapPin,
    path: 'locations',
  },
  {
    id: 'patient-documents',
    label: 'Patient Documents',
    icon: FileText,
    path: 'patient-documents',
  },
  {
    id: 'referral-history',
    label: 'Referral History',
    icon: History,
    path: 'referral-history',
  },
];

export const admissionLevelSections: ChartNavigationItem[] = [
  {
    id: 'admission-overview',
    label: 'Admission Overview',
    icon: Briefcase,
    path: 'admission-overview',
  },
  {
    id: 'visits',
    label: 'Visits',
    icon: Stethoscope,
    badge: { value: 12, variant: 'default' },
    path: 'visits',
  },
  {
    id: 'clinical-documentation',
    label: 'Clinical Documentation',
    icon: FileText,
    badge: { value: 3, variant: 'warning' },
    path: 'clinical-documentation',
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: Pill,
    path: 'orders',
  },
  {
    id: 'assessments',
    label: 'Assessments',
    icon: ClipboardCheck,
    badge: { value: 1, variant: 'danger' },
    path: 'assessments',
  },
  {
    id: 'scheduling',
    label: 'Scheduling',
    icon: Calendar,
    path: 'scheduling',
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: Receipt,
    badge: { value: 2, variant: 'warning' },
    path: 'billing',
  },
  {
    id: 'care-team',
    label: 'Care Team',
    icon: Users,
    path: 'care-team',
  },
  {
    id: 'hospice',
    label: 'Hospice',
    icon: Heart,
    path: 'hospice',
  },
];

// ==================== PATIENT CHART NAVIGATION ====================

interface PatientChartNavigationProps {
  patientData: PatientChartData;
  currentSection: ChartSection;
  onSectionChange: (section: ChartSection) => void;
  onAdmissionChange: (admissionId: string) => void;
}

export function PatientChartNavigation({
  patientData,
  currentSection,
  onSectionChange,
  onAdmissionChange,
}: PatientChartNavigationProps) {
  const [admissionSelectorOpen, setAdmissionSelectorOpen] = useState(false);

  const selectedAdmission = patientData.admissions.find(
    (a) => a.admissionId === patientData.selectedAdmissionId
  );

  const isPatientLevel = (section: ChartSection): section is PatientLevelSection => {
    return patientLevelSections.some((s) => s.id === section);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Patient Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="size-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {patientData.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{patientData.name}</h3>
            <p className="text-xs text-gray-600">
              MRN: {patientData.mrn} • DOB: {new Date(patientData.dob).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Patient-Level Sections */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <User className="size-3" />
              Patient Data
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">Constant across all admissions</p>
          </div>
          <div className="space-y-1 px-2">
            {patientLevelSections.map((section) => (
              <NavItem
                key={section.id}
                section={section}
                isActive={currentSection === section.id}
                onClick={() => onSectionChange(section.id)}
              />
            ))}
          </div>
        </div>

        {/* Admission Selector */}
        <div className="px-2 mb-4">
          <div className="mx-2 p-3 bg-indigo-50 border-2 border-indigo-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-900 uppercase">
                Selected Admission
              </span>
              {selectedAdmission && (
                <Badge
                  className={
                    selectedAdmission.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {selectedAdmission.status}
                </Badge>
              )}
            </div>
            {selectedAdmission ? (
              <button
                onClick={() => setAdmissionSelectorOpen(!admissionSelectorOpen)}
                className="w-full p-2 bg-white border border-indigo-300 rounded text-left hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {selectedAdmission.admissionId}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedAdmission.primaryPayer} • Episode {selectedAdmission.episodeNumber || 1}
                    </p>
                  </div>
                  <ChevronDown className="size-4 text-gray-500 flex-shrink-0" />
                </div>
              </button>
            ) : (
              <div className="p-2 bg-white border border-dashed border-gray-300 rounded text-center">
                <p className="text-xs text-gray-500">No admission selected</p>
              </div>
            )}

            {/* Admission Dropdown */}
            {admissionSelectorOpen && (
              <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                {patientData.admissions.map((admission) => (
                  <button
                    key={admission.admissionId}
                    onClick={() => {
                      onAdmissionChange(admission.admissionId);
                      setAdmissionSelectorOpen(false);
                    }}
                    className={`w-full p-2 rounded text-left transition-colors ${
                      admission.admissionId === patientData.selectedAdmissionId
                        ? 'bg-indigo-100 border border-indigo-300'
                        : 'bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {admission.admissionId}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(admission.startDate).toLocaleDateString()}
                          {admission.endDate && ` - ${new Date(admission.endDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Badge
                        className={
                          admission.status === 'active'
                            ? 'bg-green-100 text-green-800 text-xs'
                            : 'bg-gray-100 text-gray-800 text-xs'
                        }
                      >
                        {admission.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admission-Level Sections */}
        <div>
          <div className="px-4 mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="size-3" />
              Admission Workflows
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">Updates when switching admissions</p>
          </div>
          {selectedAdmission ? (
            <div className="space-y-1 px-2">
              {admissionLevelSections.map((section) => (
                <NavItem
                  key={section.id}
                  section={section}
                  isActive={currentSection === section.id}
                  onClick={() => onSectionChange(section.id)}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <AlertCircle className="size-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Select an admission to view workflows</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== NAV ITEM COMPONENT ====================

interface NavItemProps {
  section: ChartNavigationItem;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ section, isActive, onClick }: NavItemProps) {
  const Icon = section.icon;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm ${
        isActive
          ? 'bg-blue-100 text-blue-900 font-semibold shadow-sm'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className={`size-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
        <span className="truncate">{section.label}</span>
      </div>
      {section.badge && (
        <Badge
          className={`ml-2 text-xs ${
            section.badge.variant === 'danger'
              ? 'bg-red-100 text-red-800'
              : section.badge.variant === 'warning'
              ? 'bg-amber-100 text-amber-800'
              : section.badge.variant === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {section.badge.value}
        </Badge>
      )}
    </button>
  );
}

// ==================== SECTION CONTENT PLACEHOLDER ====================

interface SectionContentProps {
  section: ChartSection;
  patientData: PatientChartData;
  admissionId?: string;
}

export function SectionContent({ section, patientData, admissionId }: SectionContentProps) {
  const isPatientLevel = patientLevelSections.some((s) => s.id === section);
  
  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {[...patientLevelSections, ...admissionLevelSections].find((s) => s.id === section)?.label}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className={isPatientLevel ? 'bg-blue-50' : 'bg-indigo-50'}>
            {isPatientLevel ? 'Patient-Level Data' : 'Admission-Level Workflow'}
          </Badge>
          {!isPatientLevel && admissionId && (
            <Badge variant="outline" className="bg-indigo-50">
              {admissionId}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <div className="size-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            {React.createElement(
              [...patientLevelSections, ...admissionLevelSections].find((s) => s.id === section)?.icon || Activity,
              { className: 'size-8 text-gray-400' }
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Section Content</h3>
          <p className="text-sm text-gray-600 mb-4">
            {isPatientLevel
              ? 'This section displays patient-level data that remains constant across all admissions.'
              : 'This section displays admission-specific data that updates when you switch admissions.'}
          </p>
          {isPatientLevel ? (
            <div className="inline-flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-full">
              <User className="size-3" />
              Patient: {patientData.name} (MRN: {patientData.mrn})
            </div>
          ) : admissionId ? (
            <div className="inline-flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 px-3 py-2 rounded-full">
              <Briefcase className="size-3" />
              Admission: {admissionId}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
              <AlertCircle className="size-3" />
              No admission selected
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Behavior Explanation */}
      <Card className="mt-6 border-2 border-dashed">
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Data Behavior</h4>
          <div className="space-y-2 text-xs text-gray-700">
            {isPatientLevel ? (
              <>
                <div className="flex items-start gap-2">
                  <CheckIcon className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Data remains <strong>constant</strong> when switching admissions</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Shows information at the <strong>patient level</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckIcon className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Includes all data across all admissions</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <RefreshIcon className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p>Data <strong>updates automatically</strong> when switching admissions</p>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshIcon className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p>Shows information specific to <strong>selected admission</strong></p>
                </div>
                <div className="flex items-start gap-2">
                  <RefreshIcon className="size-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <p>Requires an admission to be selected</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper icons
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

// ==================== COMPLETE PATIENT CHART LAYOUT ====================

interface PatientChartLayoutProps {
  patientData: PatientChartData;
  currentSection?: ChartSection;
  onSectionChange?: (section: ChartSection) => void;
  onAdmissionChange?: (admissionId: string) => void;
  children?: React.ReactNode;
}

export function PatientChartLayout({
  patientData,
  currentSection = 'overview',
  onSectionChange,
  onAdmissionChange,
  children,
}: PatientChartLayoutProps) {
  const [section, setSection] = useState<ChartSection>(currentSection);
  const [selectedAdmission, setSelectedAdmission] = useState(patientData.selectedAdmissionId);

  const handleSectionChange = (newSection: ChartSection) => {
    setSection(newSection);
    if (onSectionChange) {
      onSectionChange(newSection);
    }
  };

  const handleAdmissionChange = (admissionId: string) => {
    setSelectedAdmission(admissionId);
    if (onAdmissionChange) {
      onAdmissionChange(admissionId);
    }
  };

  const updatedPatientData = {
    ...patientData,
    selectedAdmissionId: selectedAdmission,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className="w-80 flex-shrink-0">
        <PatientChartNavigation
          patientData={updatedPatientData}
          currentSection={section}
          onSectionChange={handleSectionChange}
          onAdmissionChange={handleAdmissionChange}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children || (
          <SectionContent
            section={section}
            patientData={updatedPatientData}
            admissionId={selectedAdmission}
          />
        )}
      </div>
    </div>
  );
}
