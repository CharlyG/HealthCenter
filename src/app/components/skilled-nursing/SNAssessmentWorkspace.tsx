/**
 * SN Assessment Workspace
 * Main workspace with queue management for SN assessments
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Filter,
  Download,
  Search,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
} from 'lucide-react';
import type { SNAssessmentListItem } from '../../data/snAssessmentGateway';

interface SNAssessmentWorkspaceProps {
  onCreateNew?: () => void;
  onViewAssessment?: (id: string) => void;
  onEditAssessment?: (id: string) => void;
}

export function SNAssessmentWorkspace({
  onCreateNew,
  onViewAssessment,
  onEditAssessment,
}: SNAssessmentWorkspaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with actual API call
  const assessments: SNAssessmentListItem[] = getMockAssessments();

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (
          !assessment.patientName.toLowerCase().includes(search) &&
          !assessment.mrn.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && assessment.status !== statusFilter) {
        return false;
      }

      // Visit type filter
      if (visitTypeFilter !== 'all' && assessment.visitType !== visitTypeFilter) {
        return false;
      }

      // Risk filter
      if (riskFilter.length > 0) {
        const hasRisk = riskFilter.some(risk => {
          if (risk === 'fall' && assessment.riskFlags.fallRisk) return true;
          if (risk === 'wound' && assessment.riskFlags.woundRisk) return true;
          if (risk === 'hospitalization' && assessment.riskFlags.hospitalizationRisk) return true;
          if (risk === 'medication' && assessment.riskFlags.medicationIssues) return true;
          if (risk === 'infection' && assessment.riskFlags.infectionConcerns) return true;
          return false;
        });
        if (!hasRisk) return false;
      }

      return true;
    });
  }, [assessments, searchTerm, statusFilter, visitTypeFilter, riskFilter]);

  const stats = useMemo(() => {
    return {
      total: assessments.length,
      draft: assessments.filter(a => a.status === 'draft').length,
      inProgress: assessments.filter(a => a.status === 'in_progress').length,
      pendingReview: assessments.filter(a => a.status === 'pending_review').length,
      completed: assessments.filter(a => a.status === 'completed').length,
      highRisk: assessments.filter(a =>
        a.riskFlags.fallRisk ||
        a.riskFlags.woundRisk ||
        a.riskFlags.hospitalizationRisk ||
        a.riskFlags.medicationIssues ||
        a.riskFlags.infectionConcerns
      ).length,
    };
  }, [assessments]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Skilled Nursing Assessments</h1>
            <p className="text-gray-600 mt-1">Manage and review nursing assessments</p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Assessment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Draft" value={stats.draft} color="gray" />
          <StatCard label="In Progress" value={stats.inProgress} color="blue" />
          <StatCard label="Pending Review" value={stats.pendingReview} color="yellow" />
          <StatCard label="Completed" value={stats.completed} color="green" />
          <StatCard label="High Risk" value={stats.highRisk} color="red" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name or MRN..."
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
              showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="pending_review">Pending Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Visit Type</label>
              <select
                value={visitTypeFilter}
                onChange={(e) => setVisitTypeFilter(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="admission">Admission</option>
                <option value="routine">Routine</option>
                <option value="prn">PRN</option>
                <option value="recert">Recertification</option>
                <option value="discharge">Discharge</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-700 mb-1 block">Risk Flags</label>
              <div className="flex flex-wrap gap-2">
                {['fall', 'wound', 'hospitalization', 'medication', 'infection'].map((risk) => (
                  <label
                    key={risk}
                    className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={riskFilter.includes(risk)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setRiskFilter([...riskFilter, risk]);
                        } else {
                          setRiskFilter(riskFilter.filter(r => r !== risk));
                        }
                      }}
                      className="rounded"
                    />
                    {risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assessment List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No assessments found</h3>
            <p className="text-gray-600">Try adjusting your filters or create a new assessment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssessments.map((assessment) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                onView={() => onViewAssessment?.(assessment.id)}
                onEdit={() => onEditAssessment?.(assessment.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
interface StatCardProps {
  label: string;
  value: number;
  color?: 'gray' | 'blue' | 'yellow' | 'green' | 'red';
}

function StatCard({ label, value, color = 'gray' }: StatCardProps) {
  const colorClasses = {
    gray: 'bg-gray-50 text-gray-900',
    blue: 'bg-blue-50 text-blue-900',
    yellow: 'bg-yellow-50 text-yellow-900',
    green: 'bg-green-50 text-green-900',
    red: 'bg-red-50 text-red-900',
  };

  return (
    <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium mt-0.5">{label}</div>
    </div>
  );
}

interface AssessmentCardProps {
  assessment: SNAssessmentListItem;
  onView: () => void;
  onEdit: () => void;
}

function AssessmentCard({ assessment, onView, onEdit }: AssessmentCardProps) {
  const statusConfig = {
    draft: { icon: Edit, label: 'Draft', color: 'bg-gray-100 text-gray-700' },
    in_progress: { icon: Clock, label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    pending_review: { icon: Clock, label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700' },
    completed: { icon: CheckCircle, label: 'Completed', color: 'bg-green-100 text-green-700' },
    signed: { icon: CheckCircle, label: 'Signed', color: 'bg-green-100 text-green-700' },
  };

  const config = statusConfig[assessment.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = config.icon;

  const hasRisk =
    assessment.riskFlags.fallRisk ||
    assessment.riskFlags.woundRisk ||
    assessment.riskFlags.hospitalizationRisk ||
    assessment.riskFlags.medicationIssues ||
    assessment.riskFlags.infectionConcerns;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{assessment.patientName}</h3>
            <span className="text-sm text-gray-500">MRN: {assessment.mrn}</span>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
              <StatusIcon className="h-3 w-3" />
              {config.label}
            </span>
            {hasRisk && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                Risk Flags
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(assessment.visitDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span className="capitalize">{assessment.visitType} Visit</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4" />
              <span>{assessment.nurseName}</span>
            </div>
            <div className="text-gray-500 text-xs">
              Created {new Date(assessment.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Risk Flags */}
          {hasRisk && (
            <div className="mt-3 flex flex-wrap gap-2">
              {assessment.riskFlags.fallRisk && <RiskBadge label="Fall Risk" />}
              {assessment.riskFlags.woundRisk && <RiskBadge label="Wound Risk" />}
              {assessment.riskFlags.hospitalizationRisk && <RiskBadge label="Hospitalization Risk" />}
              {assessment.riskFlags.medicationIssues && <RiskBadge label="Medication Issues" />}
              {assessment.riskFlags.infectionConcerns && <RiskBadge label="Infection Concerns" />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onView}
            className="px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <Eye className="h-4 w-4" />
            View
          </button>
          {(assessment.status === 'draft' || assessment.status === 'in_progress') && (
            <button
              onClick={onEdit}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ label }: { label: string }) {
  return (
    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-medium">
      {label}
    </span>
  );
}

// Mock data generator
function getMockAssessments(): SNAssessmentListItem[] {
  return [
    {
      id: 'sn-001',
      patientId: 'pt-001',
      patientName: 'Margaret Thompson',
      mrn: 'MRN-12345',
      visitDate: '2026-03-12',
      visitType: 'routine',
      status: 'in_progress',
      nurseName: 'Sarah Johnson, RN',
      riskFlags: {
        fallRisk: true,
        woundRisk: true,
        hospitalizationRisk: false,
        medicationIssues: false,
        infectionConcerns: false,
      },
      createdAt: '2026-03-12T09:00:00Z',
    },
    {
      id: 'sn-002',
      patientId: 'pt-002',
      patientName: 'Robert Williams',
      mrn: 'MRN-23456',
      visitDate: '2026-03-11',
      visitType: 'admission',
      status: 'pending_review',
      nurseName: 'Emily Davis, RN',
      riskFlags: {
        fallRisk: false,
        woundRisk: false,
        hospitalizationRisk: true,
        medicationIssues: true,
        infectionConcerns: false,
      },
      createdAt: '2026-03-11T10:30:00Z',
    },
    {
      id: 'sn-003',
      patientId: 'pt-003',
      patientName: 'Dorothy Martinez',
      mrn: 'MRN-34567',
      visitDate: '2026-03-10',
      visitType: 'routine',
      status: 'completed',
      nurseName: 'Sarah Johnson, RN',
      riskFlags: {
        fallRisk: false,
        woundRisk: false,
        hospitalizationRisk: false,
        medicationIssues: false,
        infectionConcerns: false,
      },
      createdAt: '2026-03-10T14:00:00Z',
    },
    {
      id: 'sn-004',
      patientId: 'pt-004',
      patientName: 'James Anderson',
      mrn: 'MRN-45678',
      visitDate: '2026-03-12',
      visitType: 'prn',
      status: 'in_progress',
      nurseName: 'Michael Brown, RN',
      riskFlags: {
        fallRisk: false,
        woundRisk: false,
        hospitalizationRisk: false,
        medicationIssues: false,
        infectionConcerns: true,
      },
      createdAt: '2026-03-12T11:00:00Z',
    },
    {
      id: 'sn-005',
      patientId: 'pt-005',
      patientName: 'Patricia Garcia',
      mrn: 'MRN-56789',
      visitDate: '2026-03-09',
      visitType: 'recert',
      status: 'completed',
      nurseName: 'Emily Davis, RN',
      riskFlags: {
        fallRisk: true,
        woundRisk: false,
        hospitalizationRisk: false,
        medicationIssues: false,
        infectionConcerns: false,
      },
      createdAt: '2026-03-09T13:30:00Z',
    },
  ];
}
