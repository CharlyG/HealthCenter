/**
 * Visit Timeline Standalone Page
 * 
 * Full-page timeline view accessible from patient chart or navigation.
 * Can also be used in a modal/drawer for quick access.
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Download, Filter, RefreshCw } from 'lucide-react';
import VisitTimeline, { TimelineEvent } from '../components/timeline/VisitTimeline';
import { generateTimelineEvents } from '../data/timelineDataGenerator';

export default function VisitTimelinePage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState<TimelineEvent[]>(() => generateTimelineEvents(30, 30));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setEvents(generateTimelineEvents(30, 30));
      setIsRefreshing(false);
    }, 500);
  };

  const handleExport = () => {
    // Export timeline to PDF or CSV
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patient-timeline-${patientId || 'demo'}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    if (patientId) {
      navigate(`/patient/${patientId}/chart`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Clinical Timeline
              </h1>
              <p className="text-sm text-gray-600">
                Patient: Mary Johnson (DOB: 03/15/1955) • MRN: {patientId || 'PAT-001'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-hidden p-6">
        <Card className="h-full">
          <VisitTimeline
            events={events}
            patientName="Mary Johnson"
            showFilters={true}
          />
        </Card>
      </div>
    </div>
  );
}
