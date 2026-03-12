/**
 * Authorization Tracker Page
 * 
 * Dedicated page for viewing and managing patient admission authorizations.
 * Accessible from the Patient Chart and main navigation.
 */
import { useParams, useSearchParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import AuthorizationTracker from '../components/admission/AuthorizationTracker';

export default function AuthorizationTrackerPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const admissionId = searchParams.get('admission');

  if (!patientId || !admissionId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Invalid Authorization View
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Patient ID and Admission ID are required to view authorization details.
          </p>
          <Button onClick={() => navigate('/patient')}>
            Return to Patient List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/patient/${patientId}/chart?section=billing&admission=${admissionId}`)}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Patient Chart
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Authorization Tracker</h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor and manage authorization usage for this admission
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <AuthorizationTracker patientId={patientId} admissionId={admissionId} />
        </div>
      </div>
    </div>
  );
}
