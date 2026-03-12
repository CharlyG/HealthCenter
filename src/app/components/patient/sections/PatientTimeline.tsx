/**
 * Patient Timeline Section
 * 
 * Shows the admission timeline within the Patient Chart.
 * Displays events for the currently selected admission.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  AdmissionTimeline,
  generateMockTimelineEvents,
  type TimelineEvent,
} from '../../admission/AdmissionTimeline';
import { ArrowRight, ExternalLink } from 'lucide-react';
import NoAdmissionSelected from './NoAdmissionSelected';

interface PatientTimelineProps {
  patientId: string;
  admissionId?: string;
}

export default function PatientTimeline({
  patientId,
  admissionId,
}: PatientTimelineProps) {
  const navigate = useNavigate();

  // Generate mock events for the selected admission
  const events: TimelineEvent[] = useMemo(() => {
    if (!admissionId) return [];
    return generateMockTimelineEvents(admissionId);
  }, [admissionId]);

  if (!admissionId) {
    return (
      <NoAdmissionSelected message="Select an admission to view its timeline" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admission Timeline</h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete episode of care history for this admission
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admission-timeline?admission=${admissionId}`)}
        >
          <ExternalLink className="size-4 mr-2" />
          Open Full Timeline
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{events.length}</p>
          <p className="text-xs text-blue-700 mt-1">Total Events</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-700">
            {events.filter(e => e.category === 'visit').length}
          </p>
          <p className="text-xs text-purple-700 mt-1">Visits</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-indigo-700">
            {events.filter(e => e.category === 'documentation').length}
          </p>
          <p className="text-xs text-indigo-700 mt-1">Documents</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-700">
            {events.filter(e => e.category === 'billing').length}
          </p>
          <p className="text-xs text-green-700 mt-1">Billing Events</p>
        </div>
      </div>

      {/* Timeline Component */}
      <AdmissionTimeline admissionId={admissionId} events={events} loading={false} />

      {/* Footer Action */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 mb-3">
          View the complete timeline with advanced filters and export options
        </p>
        <Button
          variant="default"
          onClick={() => navigate(`/admission-timeline?admission=${admissionId}`)}
        >
          Open Full Timeline View
          <ArrowRight className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
