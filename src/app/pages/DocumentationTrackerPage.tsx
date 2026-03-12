/**
 * Documentation Tracker Page
 * 
 * Displays comprehensive documentation completion tracking for an admission,
 * showing what's complete, pending, or missing with emphasis on billing blockers.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  DocumentationCompletionTracker,
  generateMockDocumentationItems,
  type DocumentationItem,
} from '../components/admission/DocumentationCompletionTracker';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Share2,
  Printer,
} from 'lucide-react';

interface AdmissionSummary {
  admissionId: string;
  patientName: string;
  patientMRN: string;
  admissionDate: string;
  daysSinceAdmission: number;
  readyForBilling: boolean;
}

export default function DocumentationTrackerPage() {
  const { admissionId } = useParams<{ admissionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdmissionSummary | null>(null);
  const [documents, setDocuments] = useState<DocumentationItem[]>([]);

  useEffect(() => {
    if (admissionId) {
      loadDocumentationData();
    }
  }, [admissionId]);

  const loadDocumentationData = async () => {
    if (!admissionId) return;

    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const result = await admissionGateway.getDocumentationStatus(admissionId);

      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockSummary: AdmissionSummary = {
        admissionId: admissionId,
        patientName: 'Johnson, Mary',
        patientMRN: 'MRN-001234',
        admissionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        daysSinceAdmission: 30,
        readyForBilling: false,
      };

      const mockDocuments = generateMockDocumentationItems(admissionId);

      setSummary(mockSummary);
      setDocuments(mockDocuments);
    } catch (err) {
      console.error('[DocumentationTrackerPage] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (document: DocumentationItem) => {
    console.log('Document clicked:', document);
    // TODO: Navigate to document detail or open edit modal
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="size-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading documentation tracker...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <FileText className="size-12 text-gray-300 mx-auto" />
          <div>
            <p className="text-sm font-medium text-gray-900">Admission not found</p>
            <p className="text-xs text-gray-600 mt-1">Unable to load documentation data</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admissions')}>
            Back to Admissions
          </Button>
        </div>
      </div>
    );
  }

  const billingBlockers = documents.filter(
    (d) => d.requiredForBilling && d.status !== 'completed'
  ).length;

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
                <FileText className="size-8 text-blue-600" />
                Documentation Tracker
              </h1>
              <p className="text-gray-600 mt-1">Track completion status of required documentation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadDocumentationData}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="size-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Patient Summary */}
        <Card className="border-2 border-blue-100 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{summary.patientName}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>MRN: {summary.patientMRN}</span>
                  <span>•</span>
                  <span>
                    Admitted: {new Date(summary.admissionDate).toLocaleDateString()} (
                    {summary.daysSinceAdmission} days ago)
                  </span>
                </div>
              </div>
              <div className="text-right">
                {billingBlockers === 0 ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-6 text-green-600" />
                    <div>
                      <p className="text-sm font-bold text-green-700">Ready for Billing</p>
                      <p className="text-xs text-gray-600">All required items complete</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-6 text-red-600" />
                    <div>
                      <p className="text-sm font-bold text-red-700">
                        {billingBlockers} Billing Blocker{billingBlockers > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-600">Complete to enable billing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Tracker */}
        <DocumentationCompletionTracker
          admissionId={admissionId || ''}
          documents={documents}
          onDocumentClick={handleDocumentClick}
        />

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Need to view other admission information or update records?
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
                  onClick={() => navigate(`/admissions/${admissionId}`)}
                >
                  Admission Details
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    navigate(`/patient/${summary.patientMRN}/chart?admission=${admissionId}`)
                  }
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