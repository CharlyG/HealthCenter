/**
 * HR Reporting System
 * 
 * Comprehensive reporting tools for credential expiration, training completion,
 * workload analysis, and compliance tracking with export and filtering.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Shield,
  GraduationCap,
  BarChart3,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DisciplineType } from '../../lib/caregiverTypes';
import type { CredentialType } from '../../lib/credentialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ReportType =
  | 'credential-expiration'
  | 'training-completion'
  | 'caregiver-workload'
  | 'compliance-summary';

export interface CredentialExpirationReportRow {
  caregiverId: string;
  caregiverName: string;
  discipline: DisciplineType;
  office: string;
  credentialType: CredentialType;
  credentialName: string;
  expirationDate: string;
  daysUntilExpiration: number;
  status: 'valid' | 'expiring-soon' | 'expired';
  renewalStatus?: 'not-started' | 'in-progress' | 'completed';
}

export interface TrainingCompletionReportRow {
  caregiverId: string;
  caregiverName: string;
  discipline: DisciplineType;
  office: string;
  trainingName: string;
  category: string;
  required: boolean;
  completionDate?: string;
  expirationDate?: string;
  status: 'completed' | 'overdue' | 'expiring-soon' | 'required';
  daysOverdue?: number;
}

export interface WorkloadReportRow {
  caregiverId: string;
  caregiverName: string;
  discipline: DisciplineType;
  office: string;
  activePatients: number;
  scheduledVisitsThisWeek: number;
  completedVisitsThisWeek: number;
  totalHoursThisWeek: number;
  utilizationRate: number;
  workloadStatus: 'underutilized' | 'optimal' | 'high' | 'overloaded';
}

export interface ComplianceReportRow {
  caregiverId: string;
  caregiverName: string;
  discipline: DisciplineType;
  office: string;
  complianceScore: number;
  complianceLevel: 'fully-compliant' | 'minor-issues' | 'non-compliant';
  requiredCredentialsValid: number;
  requiredCredentialsTotal: number;
  requiredTrainingCompleted: number;
  requiredTrainingTotal: number;
  criticalIssues: number;
}

export interface ReportFilters {
  discipline?: DisciplineType[];
  office?: string[];
  status?: string[];
  dateRange?: { start: string; end: string };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface HRReportingSystemProps {
  reportType: ReportType;
  data: any[];
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  onFilter?: (filters: ReportFilters) => void;
}

export default function HRReportingSystem({
  reportType,
  data,
  onExport,
  onFilter,
}: HRReportingSystemProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const reportConfig = {
    'credential-expiration': {
      title: 'Credential Expiration Report',
      icon: Shield,
      color: 'red',
      description: 'All credentials with upcoming or past expiration dates',
    },
    'training-completion': {
      title: 'Training Completion Report',
      icon: GraduationCap,
      color: 'purple',
      description: 'Training completion status and compliance tracking',
    },
    'caregiver-workload': {
      title: 'Caregiver Workload Report',
      icon: BarChart3,
      color: 'blue',
      description: 'Current workload, utilization, and capacity analysis',
    },
    'compliance-summary': {
      title: 'Compliance Summary Report',
      icon: Shield,
      color: 'green',
      description: 'Overall compliance scores and issue tracking',
    },
  };

  const config = reportConfig[reportType];
  const Icon = config.icon;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              `bg-${config.color}-100`
            )}>
              <Icon className={cn('w-6 h-6', `text-${config.color}-600`)} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
                  {Object.keys(filters).length}
                </Badge>
              )}
            </Button>

            {onExport && (
              <div className="relative">
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-3 h-3 ml-2" />
                </Button>
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg hidden group-hover:block">
                  <button
                    onClick={() => onExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => onExport('excel')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => onExport('pdf')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {data.length} record{data.length !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-600">
            Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </span>
        </div>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Report Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({});
                onFilter?.({});
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discipline
              </label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">All Disciplines</option>
                <option value="SN">SN</option>
                <option value="PT">PT</option>
                <option value="OT">OT</option>
                <option value="ST">ST</option>
                <option value="MSW">MSW</option>
                <option value="HHA">HHA</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office
              </label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">All Offices</option>
                <option value="Boston Main">Boston Main</option>
                <option value="Cambridge">Cambridge</option>
                <option value="Brookline">Brookline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">All Status</option>
                {reportType === 'credential-expiration' && (
                  <>
                    <option value="expired">Expired</option>
                    <option value="expiring-soon">Expiring Soon</option>
                    <option value="valid">Valid</option>
                  </>
                )}
                {reportType === 'training-completion' && (
                  <>
                    <option value="overdue">Overdue</option>
                    <option value="expiring-soon">Expiring Soon</option>
                    <option value="completed">Completed</option>
                  </>
                )}
                {reportType === 'caregiver-workload' && (
                  <>
                    <option value="overloaded">Overloaded</option>
                    <option value="high">High</option>
                    <option value="optimal">Optimal</option>
                    <option value="underutilized">Underutilized</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Report Data */}
      {reportType === 'credential-expiration' && (
        <CredentialExpirationReport
          data={data as CredentialExpirationReportRow[]}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      )}

      {reportType === 'training-completion' && (
        <TrainingCompletionReport
          data={data as TrainingCompletionReportRow[]}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      )}

      {reportType === 'caregiver-workload' && (
        <WorkloadReport
          data={data as WorkloadReportRow[]}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      )}

      {reportType === 'compliance-summary' && (
        <ComplianceReport
          data={data as ComplianceReportRow[]}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CREDENTIAL EXPIRATION REPORT
// ═══════════════════════════════════════════════════════════════════════════

function CredentialExpirationReport({
  data,
  onSort,
  sortField,
  sortDirection,
}: {
  data: CredentialExpirationReportRow[];
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <SortableHeader
                label="Caregiver"
                field="caregiverName"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <SortableHeader
                label="Discipline"
                field="discipline"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Credential
              </th>
              <SortableHeader
                label="Expiration Date"
                field="expirationDate"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <SortableHeader
                label="Days Until"
                field="daysUntilExpiration"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Renewal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900">{row.caregiverName}</div>
                  <div className="text-xs text-gray-600">{row.office}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant="outline" className="text-xs">
                    {row.discipline}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.credentialName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {new Date(row.expirationDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={cn(
                      'font-medium',
                      row.daysUntilExpiration < 0
                        ? 'text-red-700'
                        : row.daysUntilExpiration <= 30
                        ? 'text-amber-700'
                        : 'text-gray-900'
                    )}
                  >
                    {row.daysUntilExpiration < 0
                      ? `${Math.abs(row.daysUntilExpiration)}d overdue`
                      : `${row.daysUntilExpiration}d`}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      row.status === 'expired'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : row.status === 'expiring-soon'
                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : 'bg-green-100 text-green-700 border-green-300'
                    )}
                  >
                    {row.status.replace('-', ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.renewalStatus && (
                    <Badge variant="outline" className="text-xs">
                      {row.renewalStatus.replace('-', ' ')}
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRAINING COMPLETION REPORT
// ═══════════════════════════════════════════════════════════════════════════

function TrainingCompletionReport({
  data,
  onSort,
  sortField,
  sortDirection,
}: {
  data: TrainingCompletionReportRow[];
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <SortableHeader
                label="Caregiver"
                field="caregiverName"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Training
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Required
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Completion
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Expiration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900">{row.caregiverName}</div>
                  <div className="text-xs text-gray-600">{row.office}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900">{row.trainingName}</div>
                  <div className="text-xs text-gray-600">{row.category}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.required ? (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                      Required
                    </Badge>
                  ) : (
                    <span className="text-gray-600">Optional</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.completionDate
                    ? new Date(row.completionDate).toLocaleDateString()
                    : '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.expirationDate
                    ? new Date(row.expirationDate).toLocaleDateString()
                    : '—'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      row.status === 'overdue'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : row.status === 'expiring-soon'
                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : row.status === 'completed'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-purple-100 text-purple-700 border-purple-300'
                    )}
                  >
                    {row.status === 'overdue' && row.daysOverdue
                      ? `${row.daysOverdue}d overdue`
                      : row.status.replace('-', ' ')}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKLOAD REPORT
// ═══════════════════════════════════════════════════════════════════════════

function WorkloadReport({
  data,
  onSort,
  sortField,
  sortDirection,
}: {
  data: WorkloadReportRow[];
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <SortableHeader
                label="Caregiver"
                field="caregiverName"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <SortableHeader
                label="Active Patients"
                field="activePatients"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <SortableHeader
                label="Scheduled"
                field="scheduledVisitsThisWeek"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <SortableHeader
                label="Completed"
                field="completedVisitsThisWeek"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <SortableHeader
                label="Hours"
                field="totalHoursThisWeek"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <SortableHeader
                label="Utilization"
                field="utilizationRate"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900">{row.caregiverName}</div>
                  <div className="text-xs text-gray-600">{row.office}</div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {row.activePatients}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {row.scheduledVisitsThisWeek}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-700">
                  {row.completedVisitsThisWeek}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {row.totalHoursThisWeek}h
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {row.utilizationRate}%
                    </span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full',
                          row.utilizationRate >= 90
                            ? 'bg-red-500'
                            : row.utilizationRate >= 80
                            ? 'bg-green-500'
                            : row.utilizationRate >= 60
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        )}
                        style={{ width: `${row.utilizationRate}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      row.workloadStatus === 'overloaded'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : row.workloadStatus === 'high'
                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : row.workloadStatus === 'optimal'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-blue-100 text-blue-700 border-blue-300'
                    )}
                  >
                    {row.workloadStatus}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE REPORT
// ═══════════════════════════════════════════════════════════════════════════

function ComplianceReport({
  data,
  onSort,
  sortField,
  sortDirection,
}: {
  data: ComplianceReportRow[];
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <SortableHeader
                label="Caregiver"
                field="caregiverName"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <SortableHeader
                label="Score"
                field="complianceScore"
                onSort={onSort}
                sortField={sortField}
                sortDirection={sortDirection}
              />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Level
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Credentials
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Training
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">
                Issues
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900">{row.caregiverName}</div>
                  <div className="text-xs text-gray-600">{row.office}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={cn(
                      'text-lg font-bold',
                      row.complianceScore >= 90
                        ? 'text-green-700'
                        : row.complianceScore >= 70
                        ? 'text-amber-700'
                        : 'text-red-700'
                    )}
                  >
                    {row.complianceScore}%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      row.complianceLevel === 'fully-compliant'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : row.complianceLevel === 'minor-issues'
                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    )}
                  >
                    {row.complianceLevel.replace('-', ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={cn(
                      'font-medium',
                      row.requiredCredentialsValid === row.requiredCredentialsTotal
                        ? 'text-green-700'
                        : 'text-red-700'
                    )}
                  >
                    {row.requiredCredentialsValid}/{row.requiredCredentialsTotal}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={cn(
                      'font-medium',
                      row.requiredTrainingCompleted === row.requiredTrainingTotal
                        ? 'text-green-700'
                        : 'text-red-700'
                    )}
                  >
                    {row.requiredTrainingCompleted}/{row.requiredTrainingTotal}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.criticalIssues > 0 ? (
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                      {row.criticalIssues} critical
                    </Badge>
                  ) : (
                    <span className="text-green-700">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SORTABLE HEADER
// ═══════════════════════════════════════════════════════════════════════════

function SortableHeader({
  label,
  field,
  onSort,
  sortField,
  sortDirection,
}: {
  label: string;
  field: string;
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}) {
  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {sortField === field && (
          sortDirection === 'asc' ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )
        )}
      </div>
    </th>
  );
}
