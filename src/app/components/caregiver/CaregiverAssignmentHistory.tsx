/**
 * Caregiver Assignment History
 * 
 * Complete assignment and visit history for analyzing caregiver experience
 * and workload patterns.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  History,
  User,
  Calendar,
  Award,
  Filter,
  Download,
  ChevronRight,
  TrendingUp,
  Clock,
  MapPin,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DisciplineType } from '../../lib/caregiverTypes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PatientAssignment {
  id: string;
  patientId: string;
  patientName: string;
  admissionId: string;
  admissionNumber: string;
  discipline: DisciplineType;
  startDate: string;
  endDate?: string;
  totalVisits: number;
  completedVisits: number;
  cancelledVisits: number;
  status: 'active' | 'completed' | 'transferred';
  primaryDiagnosis?: string;
  location?: string;
}

export interface VisitHistoryRecord {
  id: string;
  visitDate: string;
  patientName: string;
  admissionNumber: string;
  discipline: DisciplineType;
  visitType: string;
  duration: number; // minutes
  status: 'completed' | 'missed' | 'cancelled';
  documentationStatus: 'complete' | 'pending' | 'incomplete';
  mileage?: number;
}

export interface AssignmentSummary {
  totalPatients: number;
  activePatients: number;
  completedPatients: number;
  totalVisits: number;
  completedVisits: number;
  averageVisitsPerPatient: number;
  disciplineBreakdown: Record<DisciplineType, number>;
  monthlyVisitTrend: { month: string; visits: number }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CaregiverAssignmentHistoryProps {
  caregiverId: string;
  caregiverName: string;
  assignments: PatientAssignment[];
  visitHistory: VisitHistoryRecord[];
  summary: AssignmentSummary;
  onViewPatient?: (patientId: string) => void;
  onViewAdmission?: (admissionId: string) => void;
  onExport?: () => void;
}

export default function CaregiverAssignmentHistory({
  caregiverId,
  caregiverName,
  assignments,
  visitHistory,
  summary,
  onViewPatient,
  onViewAdmission,
  onExport,
}: CaregiverAssignmentHistoryProps) {
  const [view, setView] = useState<'assignments' | 'visits'>('assignments');
  const [filterDiscipline, setFilterDiscipline] = useState<DisciplineType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredAssignments = assignments.filter((a) => {
    if (filterDiscipline !== 'all' && a.discipline !== filterDiscipline) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  const filteredVisits = visitHistory.filter((v) => {
    if (filterDiscipline !== 'all' && v.discipline !== filterDiscipline) return false;
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assignment History</h2>
              <p className="text-sm text-gray-600">{caregiverName}</p>
            </div>
          </div>

          {onExport && (
            <Button onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export History
            </Button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700 mb-1">Total Patients</div>
            <div className="text-2xl font-bold text-blue-900">{summary.totalPatients}</div>
            <div className="text-xs text-blue-600 mt-1">
              {summary.activePatients} active
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-700 mb-1">Total Visits</div>
            <div className="text-2xl font-bold text-green-900">{summary.totalVisits}</div>
            <div className="text-xs text-green-600 mt-1">
              {summary.completedVisits} completed
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-700 mb-1">Avg Visits/Patient</div>
            <div className="text-2xl font-bold text-purple-900">
              {summary.averageVisitsPerPatient.toFixed(1)}
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="text-sm text-amber-700 mb-1">Top Discipline</div>
            <div className="text-lg font-bold text-amber-900">
              {Object.entries(summary.disciplineBreakdown)
                .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
            <div className="text-xs text-amber-600 mt-1">
              {Object.entries(summary.disciplineBreakdown)
                .sort(([, a], [, b]) => b - a)[0]?.[1] || 0}{' '}
              assignments
            </div>
          </div>
        </div>
      </Card>

      {/* View Toggle & Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'assignments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('assignments')}
            >
              Patient Assignments ({assignments.length})
            </Button>
            <Button
              variant={view === 'visits' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('visits')}
            >
              Visit History ({visitHistory.length})
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value as any)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Disciplines</option>
              <option value="SN">SN</option>
              <option value="PT">PT</option>
              <option value="OT">OT</option>
              <option value="ST">ST</option>
              <option value="MSW">MSW</option>
              <option value="HHA">HHA</option>
            </select>

            {view === 'assignments' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="transferred">Transferred</option>
              </select>
            )}

            {view === 'visits' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {view === 'assignments' ? filteredAssignments.length : filteredVisits.length}{' '}
          {view === 'assignments' ? 'assignments' : 'visits'}
        </div>
      </Card>

      {/* Assignments View */}
      {view === 'assignments' && (
        <div className="space-y-3">
          {filteredAssignments.length === 0 ? (
            <Card className="p-12 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No assignments found</p>
            </Card>
          ) : (
            filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onViewPatient={onViewPatient}
                onViewAdmission={onViewAdmission}
              />
            ))
          )}
        </div>
      )}

      {/* Visits View */}
      {view === 'visits' && (
        <div className="space-y-3">
          {filteredVisits.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No visits found</p>
            </Card>
          ) : (
            filteredVisits.map((visit) => (
              <VisitHistoryCard key={visit.id} visit={visit} />
            ))
          )}
        </div>
      )}

      {/* Discipline Breakdown */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Experience by Discipline
        </h3>
        <div className="space-y-3">
          {Object.entries(summary.disciplineBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([discipline, count]) => (
              <DisciplineExperienceBar
                key={discipline}
                discipline={discipline as DisciplineType}
                count={count}
                total={summary.totalPatients}
              />
            ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSIGNMENT CARD
// ═══════════════════════════════════════════════════════════════════════════

function AssignmentCard({
  assignment,
  onViewPatient,
  onViewAdmission,
}: {
  assignment: PatientAssignment;
  onViewPatient?: (patientId: string) => void;
  onViewAdmission?: (admissionId: string) => void;
}) {
  const disciplineColors: Record<DisciplineType, string> = {
    SN: 'blue',
    PT: 'purple',
    OT: 'green',
    ST: 'orange',
    MSW: 'teal',
    HHA: 'pink',
  };

  const statusConfig = {
    active: { label: 'Active', color: 'green' },
    completed: { label: 'Completed', color: 'gray' },
    transferred: { label: 'Transferred', color: 'amber' },
  };

  const config = statusConfig[assignment.status];
  const completionRate = assignment.totalVisits > 0
    ? (assignment.completedVisits / assignment.totalVisits) * 100
    : 0;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4
                className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => onViewPatient?.(assignment.patientId)}
              >
                {assignment.patientName}
              </h4>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  `bg-${disciplineColors[assignment.discipline]}-100`,
                  `text-${disciplineColors[assignment.discipline]}-700`,
                  `border-${disciplineColors[assignment.discipline]}-300`
                )}
              >
                {assignment.discipline}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  config.color === 'green'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : config.color === 'amber'
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                )}
              >
                {config.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(assignment.startDate).toLocaleDateString()}
                  {assignment.endDate && ` - ${new Date(assignment.endDate).toLocaleDateString()}`}
                </span>
              </div>

              {assignment.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{assignment.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Admission:</span>
                <span
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() => onViewAdmission?.(assignment.admissionId)}
                >
                  {assignment.admissionNumber}
                </span>
              </div>

              {assignment.primaryDiagnosis && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Diagnosis:</span>
                  <span className="truncate">{assignment.primaryDiagnosis}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-gray-600">Total Visits</div>
                <div className="font-semibold text-gray-900">{assignment.totalVisits}</div>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <div className="text-green-700">Completed</div>
                <div className="font-semibold text-green-900">{assignment.completedVisits}</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-gray-600">Completion</div>
                <div className="font-semibold text-gray-900">{completionRate.toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>

        <ChevronRight
          className="w-5 h-5 text-gray-400 cursor-pointer"
          onClick={() => onViewPatient?.(assignment.patientId)}
        />
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VISIT HISTORY CARD
// ═══════════════════════════════════════════════════════════════════════════

function VisitHistoryCard({ visit }: { visit: VisitHistoryRecord }) {
  const disciplineColors: Record<DisciplineType, string> = {
    SN: 'blue',
    PT: 'purple',
    OT: 'green',
    ST: 'orange',
    MSW: 'teal',
    HHA: 'pink',
  };

  const statusConfig = {
    completed: { label: 'Completed', color: 'green', icon: '✓' },
    missed: { label: 'Missed', color: 'red', icon: '✕' },
    cancelled: { label: 'Cancelled', color: 'gray', icon: '○' },
  };

  const docStatusConfig = {
    complete: { label: 'Complete', color: 'green' },
    pending: { label: 'Pending', color: 'amber' },
    incomplete: { label: 'Incomplete', color: 'red' },
  };

  const config = statusConfig[visit.status];
  const docConfig = docStatusConfig[visit.documentationStatus];

  return (
    <Card className="p-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
            {config.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{visit.patientName}</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  `bg-${disciplineColors[visit.discipline]}-100`,
                  `text-${disciplineColors[visit.discipline]}-700`,
                  `border-${disciplineColors[visit.discipline]}-300`
                )}
              >
                {visit.discipline}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  config.color === 'green'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : config.color === 'red'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                )}
              >
                {config.label}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(visit.visitDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {visit.duration}min
              </div>
              <div>Type: {visit.visitType}</div>
              {visit.mileage && <div>{visit.mileage} miles</div>}
              <div>
                <span className="font-medium">Doc:</span>{' '}
                <span
                  className={cn(
                    'font-medium',
                    docConfig.color === 'green'
                      ? 'text-green-700'
                      : docConfig.color === 'amber'
                      ? 'text-amber-700'
                      : 'text-red-700'
                  )}
                >
                  {docConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCIPLINE EXPERIENCE BAR
// ═══════════════════════════════════════════════════════════════════════════

function DisciplineExperienceBar({
  discipline,
  count,
  total,
}: {
  discipline: DisciplineType;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  const disciplineColors: Record<DisciplineType, string> = {
    SN: 'blue',
    PT: 'purple',
    OT: 'green',
    ST: 'orange',
    MSW: 'teal',
    HHA: 'pink',
  };

  const color = disciplineColors[discipline];

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium text-gray-900">{discipline}</span>
        <span className="text-gray-600">
          {count} assignment{count !== 1 ? 's' : ''} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all', `bg-${color}-500`)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
