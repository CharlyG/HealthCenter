/**
 * ASSESSMENT WORKSPACE
 * 
 * Main workspace for all assessments
 * - Quick access to all assessment types
 * - Active assessments
 * - Pending signatures
 * - QA queue
 * - Search and filtering
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AssessmentList } from '../components/assessment/AssessmentList';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Activity,
  Users,
  Stethoscope,
  MessageSquare,
  User as UserIcon,
  Droplet,
  Heart,
  Search,
} from 'lucide-react';
import type { Assessment, AssessmentType } from '../types/assessment';
import { ASSESSMENT_TYPES } from '../types/assessment';

// Mock data
const MOCK_ASSESSMENTS: Assessment[] = [
  {
    id: 'asmt-001',
    type: 'physical-therapy',
    patientId: 'PT-1001',
    patientName: 'Margaret Anderson',
    episodeId: 'EP-2024-001',
    status: 'in-progress',
    createdAt: '2024-03-12T10:30:00',
    createdBy: 'Dr. Sarah Chen, PT',
    updatedAt: '2024-03-12T11:15:00',
    updatedBy: 'Dr. Sarah Chen, PT',
    percentComplete: 65,
    sections: [],
    validationIssues: [],
    isValid: false,
    currentVersion: 1,
    versions: [],
    data: {},
    lastAutoSave: '2024-03-12T11:15:00',
    autoSaveEnabled: true,
  },
  {
    id: 'asmt-002',
    type: 'skilled-nursing',
    patientId: 'PT-1002',
    patientName: 'Robert Johnson',
    episodeId: 'EP-2024-002',
    status: 'in-progress',
    createdAt: '2024-03-12T09:00:00',
    createdBy: 'Jessica Martinez, RN',
    updatedAt: '2024-03-12T09:45:00',
    updatedBy: 'Jessica Martinez, RN',
    percentComplete: 40,
    sections: [],
    validationIssues: [
      {
        id: 'v1',
        severity: 'error',
        field: 'Vital Signs',
        section: 'Assessment',
        message: 'Blood pressure is required',
      },
    ],
    isValid: false,
    currentVersion: 1,
    versions: [],
    data: {},
    autoSaveEnabled: true,
  },
  {
    id: 'asmt-003',
    type: 'occupational-therapy',
    patientId: 'PT-1003',
    patientName: 'Linda Davis',
    episodeId: 'EP-2024-003',
    status: 'pending-signature',
    createdAt: '2024-03-11T14:00:00',
    createdBy: 'Michael Brown, OTR',
    updatedAt: '2024-03-11T15:20:00',
    updatedBy: 'Michael Brown, OTR',
    percentComplete: 100,
    sections: [],
    validationIssues: [],
    isValid: true,
    currentVersion: 1,
    versions: [],
    data: {},
    autoSaveEnabled: true,
  },
  {
    id: 'asmt-004',
    type: 'oasis-e',
    patientId: 'PT-1004',
    patientName: 'James Wilson',
    episodeId: 'EP-2024-004',
    status: 'pending-qa',
    createdAt: '2024-03-10T08:00:00',
    createdBy: 'Emily Rodriguez, RN',
    updatedAt: '2024-03-11T10:30:00',
    updatedBy: 'Emily Rodriguez, RN',
    percentComplete: 100,
    sections: [],
    validationIssues: [],
    isValid: true,
    currentVersion: 2,
    versions: [],
    data: {},
    signature: {
      id: 'sig-001',
      signedBy: 'Emily Rodriguez, RN',
      signedByRole: 'RN',
      signedAt: '2024-03-11T10:30:00',
      signatureType: 'electronic',
    },
    autoSaveEnabled: true,
  },
];

export default function AssessmentWorkspace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const stats = {
    inProgress: MOCK_ASSESSMENTS.filter((a) => a.status === 'in-progress').length,
    pendingSignature: MOCK_ASSESSMENTS.filter((a) => a.status === 'pending-signature').length,
    pendingQA: MOCK_ASSESSMENTS.filter((a) => a.status === 'pending-qa').length,
    completedToday: 12,
  };

  const handleCreateAssessment = (type: AssessmentType) => {
    navigate(`/assessment/${type}/new`);
  };

  const handleEditAssessment = (assessment: Assessment) => {
    navigate(`/assessment/${assessment.type}/${assessment.id}`);
  };

  const filteredAssessments = MOCK_ASSESSMENTS.filter((a) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in-progress') return a.status === 'in-progress';
    if (activeTab === 'pending-signature') return a.status === 'pending-signature';
    if (activeTab === 'pending-qa') return a.status === 'pending-qa';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Workspace</h1>
            <p className="text-gray-600 mt-1">Create and manage clinical assessments</p>
          </div>
          <Button onClick={() => navigate('/assessment-analytics')} variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Signature</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingSignature}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending QA</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingQA}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Create New Assessment */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Assessment</h2>
          
          {/* Home Health Assessments */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Home Health</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.values(ASSESSMENT_TYPES)
                .filter((t) => t.category === 'home-health')
                .map((type) => (
                  <AssessmentTypeButton
                    key={type.id}
                    type={type}
                    onClick={() => handleCreateAssessment(type.id)}
                  />
                ))}
            </div>
          </div>

          {/* Hospice Assessments */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Hospice</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.values(ASSESSMENT_TYPES)
                .filter((t) => t.category === 'hospice')
                .map((type) => (
                  <AssessmentTypeButton
                    key={type.id}
                    type={type}
                    onClick={() => handleCreateAssessment(type.id)}
                  />
                ))}
            </div>
          </div>
        </Card>

        {/* Active Assessments */}
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">All ({MOCK_ASSESSMENTS.length})</TabsTrigger>
                <TabsTrigger value="in-progress">
                  In Progress ({stats.inProgress})
                </TabsTrigger>
                <TabsTrigger value="pending-signature">
                  Pending Signature ({stats.pendingSignature})
                </TabsTrigger>
                <TabsTrigger value="pending-qa">Pending QA ({stats.pendingQA})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab}>
              <AssessmentList
                assessments={filteredAssessments}
                onEdit={handleEditAssessment}
                onView={handleEditAssessment}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

// Helper component for assessment type buttons
function AssessmentTypeButton({
  type,
  onClick,
}: {
  type: any;
  onClick: () => void;
}) {
  const iconMap: Record<string, any> = {
    'oasis-e': FileText,
    'oasis-e1': FileText,
    'skilled-nursing': Stethoscope,
    'physical-therapy': Activity,
    'occupational-therapy': UserIcon,
    'speech-therapy': MessageSquare,
    'medical-social-work': Users,
    'hospice-hope': Heart,
    'hospice-admission': Heart,
    'hospice-update': Heart,
    'hospice-discharge': Heart,
  };

  const Icon = iconMap[type.id] || FileText;

  return (
    <button
      onClick={onClick}
      className="group p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
            {type.shortName}
          </h4>
          <p className="text-xs text-gray-600">{type.estimatedTime}</p>
        </div>
      </div>
      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Plus className="w-4 h-4 text-blue-600" />
      </div>
    </button>
  );
}
