/**
 * Visit Preparation Page
 * 
 * Standalone page for clinicians to prepare for patient visits.
 * Accessible from scheduling, visit lists, and caregiver workflows.
 */
import { useParams, useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import VisitPreparationPanel from '../components/poc/VisitPreparationPanel';

export default function VisitPreparationPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const patientId = searchParams.get('patientId') || '';

  if (!visitId || !patientId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Invalid Visit Preparation
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Visit ID and Patient ID are required.
          </p>
          <Button onClick={() => navigate('/poc')}>
            Return to Point of Care
          </Button>
        </div>
      </div>
    );
  }

  const handleStartVisit = () => {
    navigate(`/poc/visit/${visitId}`);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/poc')}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Visits
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Visit Preparation</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review patient information and prepare for visit
            </p>
          </div>
          <Button onClick={handleStartVisit} size="lg" className="gap-2">
            <Clock className="size-5" />
            Start Visit
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <VisitPreparationPanel
            visitId={visitId}
            patientId={patientId}
            onStartVisit={handleStartVisit}
          />
        </div>
      </div>
    </div>
  );
}
