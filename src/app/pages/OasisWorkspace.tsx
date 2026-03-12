/**
 * OASIS WORKSPACE
 * 
 * Production-grade OASIS assessment workspace with queue management
 * Supports all OASIS timepoints and workflow states
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  FileText,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Send,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  User,
} from 'lucide-react';
import type { OasisAssessment, OasisTimepoint, OasisStatus } from '../types/oasis';
import { OASIS_TIMEPOINT_CONFIG, OASIS_STATUS_CONFIG } from '../types/oasis';

// Mock data
const MOCK_OASIS_ASSESSMENTS: OasisAssessment[] = [
  {
    id: 'oasis-001',
    patientId: 'PT-1001',
    patientName: 'Margaret Anderson',
    episodeId: 'EP-2024-001',
    timepoint: 'start-of-care',
    oasisVersion: 'E1',
    assessmentDate: '2024-03-12',
    status: 'in-progress',
    createdAt: '2024-03-12T09:00:00',
    createdBy: 'Sarah Chen, RN',
    updatedAt: '2024-03-12T11:30:00',
    updatedBy: 'Sarah Chen, RN',
    percentComplete: 45,
    sections: [],
    validationIssues: [],
    isValid: false,
    data: {},
    autoSaveEnabled: true,
    dueDate: '2024-03-13',
    isOverdue: false,
    flags: [],
  },
  {
    id: 'oasis-002',
    patientId: 'PT-1002',
    patientName: 'Robert Johnson',
    episodeId: 'EP-2024-002',
    timepoint: 'recertification',
    oasisVersion: 'E1',
    assessmentDate: '2024-03-10',
    status: 'validation-errors',
    createdAt: '2024-03-10T08:00:00',
    createdBy: 'Jessica Martinez, RN',
    updatedAt: '2024-03-11T10:00:00',
    updatedBy: 'Jessica Martinez, RN',
    percentComplete: 85,
    sections: [],
    validationIssues: [
      {
        id: 'v1',
        mItem: 'M1021',
        mItemTitle: 'Primary Diagnosis',
        section: 'clinical-record',
        severity: 'error',
        message: 'ICD-10 code is required',
        autoFixable: false,
      },
    ],
    isValid: false,
    data: {},
    autoSaveEnabled: true,
    dueDate: '2024-03-11',
    isOverdue: true,
    flags: [
      {
        type: 'incomplete-data',
        message: '3 validation errors',
        severity: 'critical',
        createdAt: '2024-03-11T10:00:00',
      },
    ],
  },
  {
    id: 'oasis-003',
    patientId: 'PT-1003',
    patientName: 'Linda Davis',
    episodeId: 'EP-2024-003',
    timepoint: 'start-of-care',
    oasisVersion: 'E1',
    assessmentDate: '2024-03-11',
    status: 'pending-signature',
    createdAt: '2024-03-11T07:00:00',
    createdBy: 'Emily Rodriguez, RN',
    updatedAt: '2024-03-11T14:00:00',
    updatedBy: 'Emily Rodriguez, RN',
    percentComplete: 100,
    sections: [],
    validationIssues: [],
    isValid: true,
    data: {},
    autoSaveEnabled: true,
    dueDate: '2024-03-12',
    isOverdue: false,
    flags: [],
  },
  {
    id: 'oasis-004',
    patientId: 'PT-1004',
    patientName: 'James Wilson',
    episodeId: 'EP-2024-004',
    timepoint: 'resumption-of-care',
    oasisVersion: 'E1',
    assessmentDate: '2024-03-09',
    status: 'pending-qa',
    createdAt: '2024-03-09T10:00:00',
    createdBy: 'Michael Brown, RN',
    updatedAt: '2024-03-10T09:00:00',
    updatedBy: 'Michael Brown, RN',
    percentComplete: 100,
    sections: [],
    validationIssues: [],
    isValid: true,
    signature: {
      signedBy: 'Michael Brown, RN',
      signedByCredentials: 'RN',
      signedAt: '2024-03-10T09:00:00',
    },
    data: {},
    autoSaveEnabled: true,
    isOverdue: false,
    flags: [],
  },
  {
    id: 'oasis-005',
    patientId: 'PT-1005',
    patientName: 'Patricia Garcia',
    episodeId: 'EP-2024-005',
    timepoint: 'recertification',
    oasisVersion: 'E1',
    assessmentDate: '2024-03-08',
    status: 'returned-for-correction',
    createdAt: '2024-03-08T11:00:00',
    createdBy: 'David Lee, RN',
    updatedAt: '2024-03-11T15:00:00',
    updatedBy: 'David Lee, RN',
    percentComplete: 100,
    sections: [],
    validationIssues: [],
    isValid: true,
    signature: {
      signedBy: 'David Lee, RN',
      signedByCredentials: 'RN',
      signedAt: '2024-03-09T10:00:00',
    },
    qaReview: {
      reviewedBy: 'QA Manager',
      reviewedAt: '2024-03-10T14:00:00',
      status: 'returned',
      comments: 'Please verify M1033 - Risk for Hospitalization',
    },
    data: {},
    autoSaveEnabled: true,
    dueDate: '2024-03-09',
    isOverdue: true,
    flags: [
      {
        type: 'incomplete-data',
        message: 'QA corrections required',
        severity: 'critical',
        createdAt: '2024-03-10T14:00:00',
      },
    ],
  },
];

export default function OasisWorkspace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const stats = {
    due: MOCK_OASIS_ASSESSMENTS.filter(
      (a) => a.dueDate && !a.isOverdue && ['draft', 'in-progress'].includes(a.status)
    ).length,
    overdue: MOCK_OASIS_ASSESSMENTS.filter((a) => a.isOverdue).length,
    draft: MOCK_OASIS_ASSESSMENTS.filter((a) => a.status === 'draft').length,
    returned: MOCK_OASIS_ASSESSMENTS.filter((a) => a.status === 'returned-for-correction').length,
    readyForQA: MOCK_OASIS_ASSESSMENTS.filter((a) => a.status === 'pending-qa').length,
    completed: MOCK_OASIS_ASSESSMENTS.filter((a) =>
      ['qa-approved', 'transmitted', 'locked'].includes(a.status)
    ).length,
  };

  const handleCreateOasis = (timepoint: OasisTimepoint) => {
    navigate(`/oasis-editor/new?timepoint=${timepoint}`);
  };

  const handleEditOasis = (assessment: OasisAssessment) => {
    navigate(`/oasis-editor/${assessment.id}`);
  };

  const filteredAssessments = MOCK_OASIS_ASSESSMENTS.filter((a) => {
    if (activeTab === 'due' && (!a.dueDate || a.isOverdue || !['draft', 'in-progress'].includes(a.status))) {
      return false;
    }
    if (activeTab === 'overdue' && !a.isOverdue) return false;
    if (activeTab === 'draft' && a.status !== 'draft') return false;
    if (activeTab === 'returned' && a.status !== 'returned-for-correction') return false;
    if (activeTab === 'ready-qa' && a.status !== 'pending-qa') return false;
    if (activeTab === 'completed' && !['qa-approved', 'transmitted', 'locked'].includes(a.status)) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        a.patientName.toLowerCase().includes(query) ||
        a.patientId.toLowerCase().includes(query) ||
        a.id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">OASIS Workspace</h1>
            <p className="text-gray-600 mt-1">Manage OASIS-E/E1 assessments and workflows</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/oasis-dashboard')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New OASIS
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-6 gap-4">
          <StatCard
            title="Due Soon"
            value={stats.due}
            icon={Clock}
            color="blue"
            onClick={() => setActiveTab('due')}
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            color="red"
            onClick={() => setActiveTab('overdue')}
          />
          <StatCard
            title="Drafts"
            value={stats.draft}
            icon={FileText}
            color="gray"
            onClick={() => setActiveTab('draft')}
          />
          <StatCard
            title="Returned"
            value={stats.returned}
            icon={XCircle}
            color="amber"
            onClick={() => setActiveTab('returned')}
          />
          <StatCard
            title="Ready for QA"
            value={stats.readyForQA}
            icon={Send}
            color="purple"
            onClick={() => setActiveTab('ready-qa')}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            color="green"
            onClick={() => setActiveTab('completed')}
          />
        </div>

        {/* Create New OASIS */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New OASIS Assessment</h2>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(OASIS_TIMEPOINT_CONFIG)
              .filter(([_, config]) => config.requiresFullAssessment)
              .map(([key, config]) => (
                <TimepointButton
                  key={key}
                  timepoint={key as OasisTimepoint}
                  config={config}
                  onClick={() => handleCreateOasis(key as OasisTimepoint)}
                />
              ))}
          </div>
        </Card>

        {/* Assessment List */}
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">All ({MOCK_OASIS_ASSESSMENTS.length})</TabsTrigger>
                <TabsTrigger value="due">Due ({stats.due})</TabsTrigger>
                <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
                <TabsTrigger value="draft">Drafts ({stats.draft})</TabsTrigger>
                <TabsTrigger value="returned">Returned ({stats.returned})</TabsTrigger>
                <TabsTrigger value="ready-qa">Ready QA ({stats.readyForQA})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by patient name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            <TabsContent value={activeTab}>
              <div className="space-y-3">
                {filteredAssessments.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No assessments found</h3>
                    <p className="text-gray-600">
                      {searchQuery
                        ? 'Try adjusting your search'
                        : 'No OASIS assessments in this category'}
                    </p>
                  </div>
                ) : (
                  filteredAssessments.map((assessment) => (
                    <OasisAssessmentCard
                      key={assessment.id}
                      assessment={assessment}
                      onEdit={handleEditOasis}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <Card
      className={`p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

function TimepointButton({
  timepoint,
  config,
  onClick,
}: {
  timepoint: OasisTimepoint;
  config: any;
  onClick: () => void;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    amber: 'bg-amber-100 text-amber-600 border-amber-200',
  };

  return (
    <button
      onClick={onClick}
      className="group p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            colorClasses[config.color]
          }`}
        >
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
            {config.shortLabel}
          </h4>
          <p className="text-xs text-gray-600">{config.label}</p>
          <Badge variant="outline" className="mt-2 text-xs">
            {config.code}
          </Badge>
        </div>
      </div>
    </button>
  );
}

function OasisAssessmentCard({
  assessment,
  onEdit,
}: {
  assessment: OasisAssessment;
  onEdit: (assessment: OasisAssessment) => void;
}) {
  const timepointConfig = OASIS_TIMEPOINT_CONFIG[assessment.timepoint];
  const statusConfig = OASIS_STATUS_CONFIG[assessment.status];
  const needsAttention = assessment.isOverdue || assessment.status === 'returned-for-correction';

  return (
    <div
      className={`border rounded-lg bg-white p-4 hover:shadow-md transition-all ${
        needsAttention ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{assessment.patientName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {assessment.patientId}
                </Badge>
                <Badge className={`text-xs bg-${timepointConfig.color}-100 text-${timepointConfig.color}-700`}>
                  {timepointConfig.shortLabel}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  OASIS-{assessment.oasisVersion}
                </Badge>
              </div>
            </div>
            <Badge
              className={`${
                statusConfig.color === 'green'
                  ? 'bg-green-100 text-green-700'
                  : statusConfig.color === 'red'
                  ? 'bg-red-100 text-red-700'
                  : statusConfig.color === 'blue'
                  ? 'bg-blue-100 text-blue-700'
                  : statusConfig.color === 'amber'
                  ? 'bg-amber-100 text-amber-700'
                  : statusConfig.color === 'purple'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{assessment.createdBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Assessment: {new Date(assessment.assessmentDate).toLocaleDateString()}</span>
            </div>
            {assessment.dueDate && (
              <div className={`flex items-center gap-1 ${assessment.isOverdue ? 'text-red-600' : ''}`}>
                <Clock className="w-3 h-3" />
                <span>Due: {new Date(assessment.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span className="font-medium">{assessment.percentComplete}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${assessment.percentComplete}%` }}
              />
            </div>
          </div>

          {/* Flags & Validation */}
          {(assessment.validationIssues.length > 0 || assessment.flags.length > 0) && (
            <div className="flex items-center gap-2 mb-3 text-xs">
              {assessment.validationIssues.length > 0 && (
                <span className="text-red-600 font-medium">
                  {assessment.validationIssues.length} validation error
                  {assessment.validationIssues.length !== 1 ? 's' : ''}
                </span>
              )}
              {assessment.flags.map((flag, i) => (
                <Badge key={i} variant="outline" className="text-red-700 border-red-300">
                  {flag.message}
                </Badge>
              ))}
            </div>
          )}

          {/* QA Comments */}
          {assessment.qaReview?.comments && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3">
              <p className="text-xs text-amber-900">
                <strong>QA Comments:</strong> {assessment.qaReview.comments}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => onEdit(assessment)} className="bg-blue-600 hover:bg-blue-700">
              {assessment.status === 'draft' || assessment.status === 'in-progress' ? 'Continue' : 'View'}
            </Button>
            {assessment.status === 'pending-signature' && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Sign
              </Button>
            )}
            {assessment.isValid && assessment.status === 'in-progress' && (
              <Button size="sm" variant="outline">
                Submit for Signature
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
