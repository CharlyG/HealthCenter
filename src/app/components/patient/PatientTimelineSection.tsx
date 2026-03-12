/**
 * Patient Timeline Section
 * 
 * Compact timeline view designed for integration into Patient Chart.
 * Shows recent clinical events with option to expand to full timeline.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ExternalLink, Calendar } from 'lucide-react';
import VisitTimeline from '../timeline/VisitTimeline';
import { generateTimelineEvents } from '../../data/timelineDataGenerator';
import { useNavigate } from 'react-router';

interface PatientTimelineSectionProps {
  patientId: string;
  patientName: string;
  maxEvents?: number;
  showViewAll?: boolean;
}

export default function PatientTimelineSection({
  patientId,
  patientName,
  maxEvents = 10,
  showViewAll = true,
}: PatientTimelineSectionProps) {
  const navigate = useNavigate();
  const [events] = useState(() => generateTimelineEvents(maxEvents, 7)); // Last 7 days

  const handleViewFullTimeline = () => {
    // Navigate to dedicated timeline page or open modal
    navigate(`/visit-timeline-demo`);
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-blue-600" />
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </div>
          {showViewAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewFullTimeline}
              className="gap-2"
            >
              View Full Timeline
              <ExternalLink className="size-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[600px]">
          <VisitTimeline
            events={events}
            patientName={patientName}
            showFilters={true}
            compact={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
