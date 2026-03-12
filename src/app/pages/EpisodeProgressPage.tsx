/**
 * Episode Progress Page
 * 
 * Displays episode progress indicators for admissions, showing where
 * patients are within their certification periods with visual timelines.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  EpisodeProgressIndicator,
  generateMockEpisodeData,
  type EpisodeProgressData,
  type EpisodeMilestone,
} from '../components/admission/EpisodeProgressIndicator';
import {
  ArrowLeft,
  Calendar,
  Loader2,
  RefreshCw,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  BarChart3,
  Download,
} from 'lucide-react';

export default function EpisodeProgressPage() {
  const { admissionId } = useParams<{ admissionId?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<EpisodeProgressData | null>(null);
  const [view, setView] = useState<'detailed' | 'compact'>('detailed');

  // Use a default admissionId if none provided
  const effectiveAdmissionId = admissionId || 'ADM-2024-001';

  useEffect(() => {
    loadEpisodeData();
  }, [effectiveAdmissionId]);

  const loadEpisodeData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const result = await admissionGateway.getEpisodeProgress(effectiveAdmissionId);

      await new Promise((resolve) => setTimeout(resolve, 600));

      const mockEpisode = generateMockEpisodeData(effectiveAdmissionId);
      setEpisode(mockEpisode);
    } catch (err) {
      console.error('[EpisodeProgressPage] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneClick = (milestone: EpisodeMilestone) => {
    console.log('Milestone clicked:', milestone);
    // TODO: Navigate to milestone detail or open modal
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="size-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading episode progress...</p>
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Calendar className="size-12 text-gray-300 mx-auto" />
          <div>
            <p className="text-sm font-medium text-gray-900">Episode not found</p>
            <p className="text-xs text-gray-600 mt-1">Unable to load episode data</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admissions')}>
            Back to Admissions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admissions/${admissionId}`)}
            >
              <ArrowLeft className="size-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="size-8 text-blue-600" />
                Episode Progress
              </h1>
              <p className="text-gray-600 mt-1">
                Track patient progress within certification period
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadEpisodeData}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Patient Info Card */}
        <Card className="border-2 border-blue-100 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{episode.patientName}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>Admission ID: {episode.admissionId}</span>
                  <span>•</span>
                  <span>60-Day Certification Period</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-sm font-semibold ${
                  episode.status === 'active'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : episode.status === 'pending_recert'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : episode.status === 'discharged'
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}
              >
                {episode.status === 'active'
                  ? 'Active Episode'
                  : episode.status === 'pending_recert'
                  ? 'Pending Recertification'
                  : episode.status === 'discharged'
                  ? 'Discharged'
                  : 'Expired'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <Tabs value={view} onValueChange={(v) => setView(v as 'detailed' | 'compact')}>
            <TabsList>
              <TabsTrigger value="detailed">Detailed View</TabsTrigger>
              <TabsTrigger value="compact">Compact View</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="size-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Episode Progress Indicator */}
        {view === 'detailed' ? (
          <EpisodeProgressIndicator
            episode={episode}
            showMilestones={true}
            onMilestoneClick={handleMilestoneClick}
          />
        ) : (
          <Card>
            <CardContent className="p-6">
              <EpisodeProgressIndicator episode={episode} compact={true} />
            </CardContent>
          </Card>
        )}

        {/* Additional Context Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="size-4 text-blue-600" />
                Episode Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Visits Completed</span>
                <span className="font-bold text-gray-900">12 / 20</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Authorization Used</span>
                <span className="font-bold text-gray-900">60%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Compliance Score</span>
                <span className="font-bold text-green-700">95%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="size-4 text-purple-600" />
                Care Team Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Disciplines</span>
                <span className="font-bold text-gray-900">3</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Scheduled Visits</span>
                <span className="font-bold text-gray-900">5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pending Tasks</span>
                <span className="font-bold text-amber-700">2</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="size-4 text-teal-600" />
                Documentation Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Visit Notes</span>
                <span className="font-bold text-green-700">Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">OASIS Assessment</span>
                <span className="font-bold text-green-700">Complete</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Recert Documents</span>
                <span className="font-bold text-amber-700">Pending</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                View related information or take action on this episode
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admissions/${admissionId}/timeline`)}
                >
                  View Timeline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admissions/${admissionId}/documentation`)}
                >
                  Documentation
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/admissions/${admissionId}`)}
                >
                  Admission Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">Understanding Episode Progress</p>
                <p className="mt-1 text-blue-800">
                  Medicare home health operates on 60-day certification periods. Monitor progress
                  to ensure timely recertification or discharge planning. Critical milestones
                  include OASIS assessments, physician certifications, and authorization renewals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}