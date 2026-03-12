/**
 * ASSESSMENT MANAGEMENT DASHBOARD
 * 
 * Central hub for all clinical assessments
 * Features:
 * - Quick access to all 6+ assessment types
 * - Active assessments in progress
 * - Pending signatures queue
 * - Completed assessments archive
 * - Search and filtering
 * - Analytics cards
 * 
 * @version 1.0.0
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  Users,
  Stethoscope,
  MessageSquare,
  User,
  Droplet,
  ClipboardList,
  ArrowRight,
  Calendar,
  Edit,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

interface AssessmentType {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: any;
  color: string;
  category: 'therapy' | 'nursing' | 'specialized';
  estimatedTime: string;
}

const ASSESSMENT_TYPES: AssessmentType[] = [
  {
    id: 'skilled-nursing',
    name: 'Skilled Nursing Visit Note',
    shortName: 'SN Visit',
    description: 'Comprehensive nursing assessment and visit documentation',
    icon: Stethoscope,
    color: 'blue',
    category: 'nursing',
    estimatedTime: '20-30 min',
  },
  {
    id: 'physical-therapy',
    name: 'Physical Therapy Evaluation',
    shortName: 'PT Eval',
    description: 'ROM, strength, gait, balance, and functional mobility assessment',
    icon: Activity,
    color: 'green',
    category: 'therapy',
    estimatedTime: '30-45 min',
  },
  {
    id: 'occupational-therapy',
    name: 'Occupational Therapy Evaluation',
    shortName: 'OT Eval',
    description: 'ADLs, IADLs, fine motor skills, and home safety assessment',
    icon: User,
    color: 'purple',
    category: 'therapy',
    estimatedTime: '30-40 min',
  },
  {
    id: 'speech-therapy',
    name: 'Speech-Language Pathology Evaluation',
    shortName: 'SLP Eval',
    description: 'Swallowing, speech, voice, and cognitive-linguistic assessment',
    icon: MessageSquare,
    color: 'amber',
    category: 'therapy',
    estimatedTime: '25-35 min',
  },
  {
    id: 'home-health-aide',
    name: 'Home Health Aide Visit Note',
    shortName: 'HHA Visit',
    description: 'Personal care, hygiene, nutrition, and mobility assistance',
    icon: Users,
    color: 'cyan',
    category: 'nursing',
    estimatedTime: '10-15 min',
  },
  {
    id: 'wound-care',
    name: 'Wound Care Assessment',
    shortName: 'Wound',
    description: 'Detailed wound measurements, staging, and treatment documentation',
    icon: Droplet,
    color: 'red',
    category: 'specialized',
    estimatedTime: '15-25 min',
  },
];

// Mock data for active assessments
const MOCK_ACTIVE_ASSESSMENTS = [
  {
    id: 'asmt-001',
    type: 'physical-therapy',
    patientName: 'Margaret Anderson',
    patientId: 'PT-1001',
    episodeId: 'EP-2024-001',
    status: 'in-progress',
    progress: 65,
    startedAt: '2024-03-12T10:30:00',
    lastModified: '2024-03-12T11:15:00',
    clinician: 'Dr. Sarah Chen, PT',
  },
  {
    id: 'asmt-002',
    type: 'skilled-nursing',
    patientName: 'Robert Johnson',
    patientId: 'PT-1002',
    episodeId: 'EP-2024-002',
    status: 'in-progress',
    progress: 40,
    startedAt: '2024-03-12T09:00:00',
    lastModified: '2024-03-12T09:45:00',
    clinician: 'Jessica Martinez, RN',
  },
  {
    id: 'asmt-003',
    type: 'occupational-therapy',
    patientName: 'Linda Davis',
    patientId: 'PT-1003',
    episodeId: 'EP-2024-003',
    status: 'ready-for-signature',
    progress: 100,
    startedAt: '2024-03-11T14:00:00',
    completedAt: '2024-03-11T15:20:00',
    clinician: 'Michael Brown, OTR',
  },
  {
    id: 'asmt-004',
    type: 'wound-care',
    patientName: 'James Wilson',
    patientId: 'PT-1004',
    episodeId: 'EP-2024-004',
    status: 'ready-for-signature',
    progress: 100,
    startedAt: '2024-03-12T08:00:00',
    completedAt: '2024-03-12T08:30:00',
    clinician: 'Emily Rodriguez, RN, CWCN',
  },
  {
    id: 'asmt-005',
    type: 'speech-therapy',
    patientName: 'Patricia Miller',
    patientId: 'PT-1005',
    episodeId: 'EP-2024-005',
    status: 'in-progress',
    progress: 20,
    startedAt: '2024-03-12T13:00:00',
    lastModified: '2024-03-12T13:10:00',
    clinician: 'David Lee, SLP',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AssessmentManagementDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const inProgress = MOCK_ACTIVE_ASSESSMENTS.filter(a => a.status === 'in-progress').length;
    const pendingSignature = MOCK_ACTIVE_ASSESSMENTS.filter(a => a.status === 'ready-for-signature').length;
    const completedToday = 8; // Mock
    const averageCompletionTime = '22 min'; // Mock

    return { inProgress, pendingSignature, completedToday, averageCompletionTime };
  }, []);

  // Filter assessments
  const filteredAssessments = useMemo(() => {
    return MOCK_ACTIVE_ASSESSMENTS.filter(assessment => {
      const matchesSearch = assessment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assessment.patientId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
      
      const assessmentType = ASSESSMENT_TYPES.find(t => t.id === assessment.type);
      const matchesCategory = categoryFilter === 'all' || assessmentType?.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  const handleCreateAssessment = (typeId: string) => {
    navigate(`/assessment/${typeId}/new`);
  };

  const handleEditAssessment = (assessment: any) => {
    navigate(`/assessment/${assessment.type}/${assessment.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Management</h1>
            <p className="text-gray-600 mt-1">Create, manage, and review clinical assessments</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/assessment-workspace')}>
              <ClipboardList className="w-4 h-4 mr-2" />
              Assessment Workspace
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
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
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              <span>Active sessions</span>
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
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>Awaiting review</span>
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
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>Last 24 hours</span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageCompletionTime}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>This week</span>
            </div>
          </Card>
        </div>

        {/* Create New Assessment Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create New Assessment</h2>
            <Badge variant="outline">6 Assessment Types Available</Badge>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {ASSESSMENT_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleCreateAssessment(type.id)}
                  className="group relative p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 bg-${type.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 text-${type.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                        {type.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{type.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {type.shortName}
                        </Badge>
                        <span className="text-xs text-gray-500">{type.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Active Assessments Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Assessments</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="ready-for-signature">Pending Signature</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="nursing">Nursing</SelectItem>
                  <SelectItem value="specialized">Specialized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No assessments found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or create a new assessment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssessments.map(assessment => {
                const assessmentType = ASSESSMENT_TYPES.find(t => t.id === assessment.type)!;
                const Icon = assessmentType.icon;

                return (
                  <div
                    key={assessment.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all bg-white"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon & Type */}
                      <div className={`w-12 h-12 bg-${assessmentType.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 text-${assessmentType.color}-600`} />
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{assessment.patientName}</h3>
                          <Badge variant="outline" className="text-xs">{assessment.patientId}</Badge>
                          <Badge variant="secondary" className="text-xs">{assessmentType.shortName}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {assessment.clinician}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(assessment.startedAt).toLocaleString()}
                          </span>
                          {assessment.status === 'in-progress' && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Last saved: {new Date(assessment.lastModified).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress/Status */}
                      <div className="flex items-center gap-4">
                        {assessment.status === 'in-progress' ? (
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Progress</span>
                              <span className="font-medium">{assessment.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${assessment.progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending Signature
                          </Badge>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {assessment.status === 'in-progress' ? (
                            <Button
                              size="sm"
                              onClick={() => handleEditAssessment(assessment)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Continue
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEditAssessment(assessment)}>
                                <Eye className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Sign
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/assessment-history')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Assessment History</h3>
                <p className="text-sm text-gray-600 mt-1">View completed assessments</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/qa-workspace')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">QA Review Queue</h3>
                <p className="text-sm text-gray-600 mt-1">Assessments pending QA review</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/assessment-workspace')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Analytics Dashboard</h3>
                <p className="text-sm text-gray-600 mt-1">Assessment metrics and trends</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
