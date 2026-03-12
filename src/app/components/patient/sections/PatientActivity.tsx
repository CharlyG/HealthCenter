/**
 * Patient Activity Section
 * Timeline of all patient-related activities fetched from the server timeline endpoint
 */
import { useState, useEffect, useCallback } from 'react';
import { ActivityFeed } from '../../design-system/ActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { History, Loader2 } from 'lucide-react';
import { timelineGateway } from '../../../lib/dataGateway';

interface PatientActivityProps {
  patientId: string;
  /** When provided, only activity for this admission is shown */
  admissionId?: string;
}

export default function PatientActivity({ patientId, admissionId }: PatientActivityProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await timelineGateway.getByPatientId(patientId, {
        pagination: { page: 1, pageSize: 50 },
      });
      const mapped = (res.data || []).map((evt) => ({
        id: evt.id,
        user: evt.caregiver || evt.caregiverRole || 'System',
        action: evt.title,
        timestamp: new Date(evt.timestamp),
        details: evt.summary,
      }));
      setActivities(mapped);
    } catch (err) {
      console.error('[PatientActivity] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Activity Timeline</h2>
        <p className="text-gray-600 mt-1">Complete history of patient interactions and changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading activity...</span>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No activity recorded yet</p>
          ) : (
            <ActivityFeed activities={activities} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
