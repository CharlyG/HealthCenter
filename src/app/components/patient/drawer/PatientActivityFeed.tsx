/**
 * Patient Activity Feed - Right Drawer Component
 * Compact activity timeline pulled from the server's timeline endpoint
 */
import { useState, useEffect, useCallback } from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { timelineGateway } from '../../../lib/dataGateway';

interface PatientActivityFeedProps {
  patientId: string;
}

export default function PatientActivityFeed({ patientId }: PatientActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await timelineGateway.getByPatientId(patientId, {
        pagination: { page: 1, pageSize: 10 },
      });
      setActivities(
        (res.data || []).map((evt) => ({
          id: evt.id,
          user: evt.caregiver || evt.caregiverRole || 'System',
          action: evt.title,
          timestamp: new Date(evt.timestamp),
          summary: evt.summary,
        })),
      );
    } catch (err) {
      console.error('[PatientActivityFeed] error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="size-5 text-blue-500 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="size-4" />
          Activity Feed
          {activities.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs">{activities.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            <Clock className="size-8 mx-auto mb-2 text-gray-400" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {index < activities.length - 1 && (
                  <div className="absolute left-2 top-6 bottom-0 w-px bg-gray-200" />
                )}

                <div className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="size-4 bg-blue-600 rounded-full border-2 border-white" />
                  </div>

                  <div className="flex-1 min-w-0 pb-4">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-gray-600">{activity.action}</span>
                    </p>
                    {activity.summary && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.summary}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
