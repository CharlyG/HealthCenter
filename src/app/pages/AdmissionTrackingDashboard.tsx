/**
 * Admission Tracking Dashboard
 * 
 * Combined view showing both Episode Progress and Documentation Completion
 * for comprehensive admission monitoring.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  EpisodeProgressIndicator,
  generateMockEpisodeData,
  generateMockMilestones,
  type EpisodeData,
  type EpisodeMilestone,
} from '../components/admission/EpisodeProgressIndicator';
import {
  DocumentationCompletionTracker,
  generateMockDocumentationItems,
  type DocumentationItem,
} from '../components/admission/DocumentationCompletionTracker';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  LayoutDashboard,
  User,
} from 'lucide-react';

interface PatientInfo {
  patientId: string;
  patientName: string;
  patientMRN: string;
  admissionId: string;
  diagnosis: string;
  assignedNurse: string;
}

export default function AdmissionTrackingDashboard() {
  const { admissionId } = useParams<{ admissionId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'episode' | 'documentation'>('overview');

  // Data states
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [episode, setEpisode] = useState<EpisodeData | null>(null);
  const [milestones, setMilestones] = useState<EpisodeMilestone[]>([]);
  const [documents, setDocuments] = useState<DocumentationItem[]>([]);

  // Get admission ID from params or search params
  const currentAdmissionId = admissionId || searchParams.get('admission') || 'ADM-001234';

  useEffect(() => {
    loadData();
  }, [currentAdmissionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API calls
      // const [patientData, episodeData, docsData] = await Promise.all([
      //   admissionGateway.getPatientInfo(currentAdmissionId),
      //   admissionGateway.getEpisodeProgress(currentAdmissionId),
      //   admissionGateway.getDocumentationStatus(currentAdmissionId),
      // ]);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockPatient: PatientInfo = {
        patientId: 'PAT-001234',
        patientName: 'Johnson, Mary',
        patientMRN: 'MRN-001234',
        admissionId: currentAdmissionId,
        diagnosis: 'CHF, Diabetes Type 2, Hypertension',
        assignedNurse: 'Jennifer Lee, RN',
      };

      const mockEpisode = generateMockEpisodeData(currentAdmissionId);
      const mockMilestones = generateMockMilestones(mockEpisode.startDate);
      const mockDocuments = generateMockDocumentationItems(currentAdmissionId);

      setPatientInfo(mockPatient);
      setEpisode({ ...mockEpisode, patientName: mockPatient.patientName });
      setMilestones(mockMilestones);
      setDocuments(mockDocuments);
    } catch (err) {
      console.error('[AdmissionTrackingDashboard] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Loading admission tracking...</p>
        </div>
      </div>
    );
  }

  if (!patientInfo || !episode) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Activity className="size-12 text-gray-300 mx-auto" />
          <div>
            <p className="text-sm font-medium text-gray-900">Unable to load admission data</p>
            <p className="text-xs text-gray-600 mt-1">Please try again</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admissions')}>
            Back to Admissions
          </Button>
        </div>
      </div>
    );
  }

  // Calculate summary metrics
  const episodeDaysRemaining = Math.max(
    0,
    Math.ceil((new Date(episode.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );
  const completedDocs = documents.filter((d) => d.status === 'completed').length;
  const billingBlockers = documents.filter(
    (d) => d.requiredForBilling && d.status !== 'completed'
  ).length;
  const completedMilestones = milestones.filter((m) => m.completed).length;

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admissions/${currentAdmissionId}`)}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutDashboard className="size-8 text-blue-600" />
                Admission Tracking
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive progress and documentation monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Patient Header Card */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="size-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{patientInfo.patientName}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                    <span>MRN: {patientInfo.patientMRN}</span>
                    <span>•</span>
                    <span>Admission: {currentAdmissionId}</span>
                    <span>•</span>
                    <span>{patientInfo.assignedNurse}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{patientInfo.diagnosis}</p>
                </div>
              </div>

              {/* Quick Status Indicators */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center bg-white rounded-lg p-2 border border-blue-200 min-w-[80px]">
                  <p className="text-xl font-bold text-blue-700">{episodeDaysRemaining}</p>
                  <p className="text-[10px] text-gray-600">Days Left</p>
                </div>
                <div className="text-center bg-white rounded-lg p-2 border border-green-200 min-w-[80px]">
                  <p className="text-xl font-bold text-green-700">
                    {completedDocs}/{documents.length}
                  </p>
                  <p className="text-[10px] text-gray-600">Docs Done</p>
                </div>
                <div className="text-center bg-white rounded-lg p-2 border border-red-200 min-w-[80px]">
                  <p className="text-xl font-bold text-red-700">{billingBlockers}</p>
                  <p className="text-[10px] text-gray-600">Blockers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="episode" className="flex items-center gap-2">
              <Calendar className="size-4" />
              Episode Progress
              {episodeDaysRemaining <= 7 && (
                <Badge className="ml-1 bg-red-600 text-white text-[10px] h-4 px-1">!</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FileText className="size-4" />
              Documentation
              {billingBlockers > 0 && (
                <Badge className="ml-1 bg-red-600 text-white text-[10px] h-4 px-1">
                  {billingBlockers}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Alert Section */}
            {(billingBlockers > 0 || episodeDaysRemaining <= 14) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {episodeDaysRemaining <= 14 && (
                  <Card className="border-2 border-orange-200 bg-orange-50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <AlertTriangle className="size-6 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-orange-900 text-sm">
                          Episode Ending Soon
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Only {episodeDaysRemaining} days remaining. Begin recertification process.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-300 text-orange-700"
                        onClick={() => setActiveTab('episode')}
                      >
                        View
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {billingBlockers > 0 && (
                  <Card className="border-2 border-red-200 bg-red-50">
                    <CardContent className="p-4 flex items-start gap-3">
                      <AlertTriangle className="size-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-red-900 text-sm">
                          {billingBlockers} Billing Blockers
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          Critical documentation items preventing claim submission.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700"
                        onClick={() => setActiveTab('documentation')}
                      >
                        View
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Compact Progress Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="size-4 text-blue-600" />
                  Episode Progress
                </h3>
                <EpisodeProgressIndicator episode={episode} compact={true} />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setActiveTab('episode')}
                >
                  View Full Episode Timeline
                </Button>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="size-4 text-green-600" />
                  Documentation Status
                </h3>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Overall Completion</span>
                      <span className="text-2xl font-bold text-blue-700">
                        {Math.round((completedDocs / documents.length) * 100)}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="size-3 text-green-600" />
                          <span>Completed</span>
                        </div>
                        <span className="font-semibold">{completedDocs}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3 text-yellow-600" />
                          <span>Pending</span>
                        </div>
                        <span className="font-semibold">
                          {documents.filter((d) => d.status === 'pending').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="size-3 text-red-600" />
                          <span>Billing Blockers</span>
                        </div>
                        <span className="font-semibold text-red-600">{billingBlockers}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setActiveTab('documentation')}
                >
                  View All Documentation
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col gap-2"
                  onClick={() =>
                    navigate(`/patient/${patientInfo.patientId}/chart?admission=${currentAdmissionId}`)
                  }
                >
                  <User className="size-5" />
                  <span className="text-xs">Patient Chart</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col gap-2"
                  onClick={() => navigate(`/admissions/${currentAdmissionId}/timeline`)}
                >
                  <Activity className="size-5" />
                  <span className="text-xs">Timeline</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col gap-2"
                  onClick={() => navigate(`/authorization-tracker?admission=${currentAdmissionId}`)}
                >
                  <CheckCircle2 className="size-5" />
                  <span className="text-xs">Authorizations</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-3 flex flex-col gap-2"
                  onClick={() => navigate(`/scheduling?admission=${currentAdmissionId}`)}
                >
                  <Calendar className="size-5" />
                  <span className="text-xs">Schedule Visit</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Episode Progress Tab */}
          <TabsContent value="episode">
            <EpisodeProgressIndicator
              episode={episode}
              milestones={milestones}
              showMilestones={true}
            />
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation">
            <DocumentationCompletionTracker
              admissionId={currentAdmissionId}
              documents={documents}
              onDocumentClick={(doc) => console.log('Document clicked:', doc)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
