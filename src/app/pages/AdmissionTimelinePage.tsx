/**
 * Admission Timeline Page
 * 
 * Displays a comprehensive timeline view of the entire episode of care
 * for a specific admission. Shows all major events from admission creation
 * through discharge.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  AdmissionTimeline,
  generateMockTimelineEvents,
  type TimelineEvent,
} from '../components/admission/AdmissionTimeline';
import {
  ArrowLeft,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  User,
  CreditCard,
  Activity,
  Clock,
  Loader2,
} from 'lucide-react';

interface AdmissionSummary {
  admissionId: string;
  patientName: string;
  patientMRN: string;
  admissionDate: string;
  primaryPayer: string;
  status: string;
  assignedCoordinator: string;
  daysSinceAdmission: number;
  totalVisits: number;
  nextVisitDate?: string;
}

export default function AdmissionTimelinePage() {
  const { admissionId } = useParams<{ admissionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdmissionSummary | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (admissionId) {
      loadTimelineData();
    }
  }, [admissionId]);

  const loadTimelineData = async () => {
    if (!admissionId) return;

    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const result = await admissionGateway.getTimeline(admissionId);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockSummary: AdmissionSummary = {
        admissionId: admissionId,
        patientName: 'Johnson, Mary',
        patientMRN: 'MRN-001234',
        admissionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Medicare Part A',
        status: 'active',
        assignedCoordinator: 'Sarah Martinez',
        daysSinceAdmission: 30,
        totalVisits: 12,
        nextVisitDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockEvents = generateMockTimelineEvents(admissionId);
      
      setSummary(mockSummary);
      setEvents(mockEvents);
    } catch (err) {
      console.error('[AdmissionTimelinePage] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="size-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading admission timeline...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Activity className="size-12 text-gray-300 mx-auto" />
          <div>
            <p className="text-sm font-medium text-gray-900">Admission not found</p>
            <p className="text-xs text-gray-600 mt-1">Unable to load timeline data</p>
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
      <div className="max-w-5xl mx-auto p-6 space-y-6">
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
                <Activity className="size-8 text-blue-600" />
                Admission Timeline
              </h1>
              <p className="text-gray-600 mt-1">
                Complete episode of care history
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadTimelineData}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Admission Summary Card */}
        <Card className="border-2 border-blue-100 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="size-4 text-blue-600" />
              Admission Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Patient Info */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{summary.patientName}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">MRN: {summary.patientMRN}</p>
                </div>
                <Badge
                  className={`${
                    summary.status === 'active'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : summary.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  } border capitalize`}
                >
                  {summary.status}
                </Badge>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="size-3.5" />
                    <span className="text-xs">Admission Date</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {new Date(summary.admissionDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="size-3.5" />
                    <span className="text-xs">Days in Service</span>
                  </div>
                  <p className="font-semibold text-gray-900">{summary.daysSinceAdmission} days</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <CreditCard className="size-3.5" />
                    <span className="text-xs">Primary Payer</span>
                  </div>
                  <p className="font-semibold text-gray-900">{summary.primaryPayer}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <User className="size-3.5" />
                    <span className="text-xs">Coordinator</span>
                  </div>
                  <p className="font-semibold text-gray-900">{summary.assignedCoordinator}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                <p className="text-2xl font-bold text-blue-700">{summary.totalVisits}</p>
                <p className="text-xs text-gray-600 mt-1">Total Visits</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                <p className="text-xs text-gray-600 mt-1">Timeline Events</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
                {summary.nextVisitDate ? (
                  <>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(summary.nextVisitDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Next Visit</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-400">—</p>
                    <p className="text-xs text-gray-600 mt-1">No Visit Scheduled</p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Episode of Care Timeline</h2>
            <p className="text-sm text-gray-600">
              Chronological view of all events during this admission
            </p>
          </div>
          <AdmissionTimeline admissionId={admissionId || ''} events={events} loading={false} />
        </div>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Need to update this admission or add new information?
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admissions/${admissionId}`)}
                >
                  View Admission Details
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/patient/${summary.patientMRN}/chart?admission=${admissionId}`)}
                >
                  Open Patient Chart
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
