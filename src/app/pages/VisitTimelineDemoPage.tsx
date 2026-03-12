/**
 * Visit Timeline Demo Page
 * 
 * Demonstrates the Visit Timeline component with realistic clinical events.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import VisitTimeline, { TimelineEvent } from '../components/timeline/VisitTimeline';
import { generateDemoTimelineEvents } from '../data/timelineDataGenerator';
import { RefreshCw, User, Calendar, Info } from 'lucide-react';

export default function VisitTimelineDemoPage() {
  const [events, setEvents] = useState<TimelineEvent[]>(() => generateDemoTimelineEvents());
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const handleRefresh = () => {
    setEvents(generateDemoTimelineEvents());
    setSelectedEvent(null);
  };

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Visit Timeline Demo
                </h1>
                <p className="text-gray-600">
                  Chronological view of clinical events for quick patient history review
                </p>
              </div>
              <Button onClick={handleRefresh} className="gap-2">
                <RefreshCw className="size-4" />
                Refresh Data
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    <User className="size-4" />
                    Patient Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-800">
                    Timeline shows all clinical events for a single patient across multiple visits
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-green-900 flex items-center gap-2">
                    <Calendar className="size-4" />
                    Chronological Order
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800">
                    Events sorted by most recent first with relative timestamps (e.g., "2h ago")
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <Info className="size-4" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-800">
                    Click expand button on any event to view detailed information
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline - Takes up 2 columns */}
            <div className="lg:col-span-2">
              <Card className="h-[calc(100vh-280px)]">
                <VisitTimeline
                  events={events}
                  patientName="Mary Johnson (DOB: 03/15/1955)"
                  showFilters={true}
                  onEventClick={handleEventClick}
                />
              </Card>
            </div>

            {/* Event Detail Panel */}
            <div className="lg:col-span-1">
              <Card className="h-[calc(100vh-280px)] flex flex-col">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-lg">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4">
                  {selectedEvent ? (
                    <div className="space-y-4">
                      {/* Event Type Badge */}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Event Type</p>
                        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {selectedEvent.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Title</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedEvent.title}</p>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Description</p>
                        <p className="text-sm text-gray-700">{selectedEvent.description}</p>
                      </div>

                      {/* Timestamp */}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Timestamp</p>
                        <p className="text-sm text-gray-900">
                          {selectedEvent.timestamp.toLocaleString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>

                      {/* Staff Member */}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Staff Member</p>
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="size-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedEvent.staff_member.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {selectedEvent.staff_member.role}
                              {selectedEvent.staff_member.credentials && ` • ${selectedEvent.staff_member.credentials}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      {selectedEvent.status && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Status</p>
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            selectedEvent.status === 'completed' ? 'bg-green-100 text-green-800' :
                            selectedEvent.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            selectedEvent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedEvent.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </div>
                        </div>
                      )}

                      {/* Visit ID */}
                      {selectedEvent.visit_id && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Visit ID</p>
                          <p className="text-sm text-gray-900 font-mono">{selectedEvent.visit_id}</p>
                        </div>
                      )}

                      {/* Additional Details */}
                      {selectedEvent.details && Object.keys(selectedEvent.details).length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">Additional Details</p>
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                            {Object.entries(selectedEvent.details).map(([key, value]) => (
                              <div key={key} className="flex items-start gap-2">
                                <span className="text-xs font-semibold text-gray-700 min-w-[120px]">
                                  {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}:
                                </span>
                                <span className="text-xs text-gray-600 flex-1">
                                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw Data (for demo purposes) */}
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Raw Event Data</p>
                        <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-auto max-h-60">
                          {JSON.stringify(selectedEvent, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <Calendar className="size-16 text-gray-300 mb-4" />
                      <p className="text-sm font-semibold text-gray-900 mb-2">
                        No Event Selected
                      </p>
                      <p className="text-xs text-gray-600">
                        Click on any timeline event to view detailed information
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Color Coding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600">
                    Each event type has a unique color: Visits (blue), Notes (purple), Orders (orange), etc.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Filtering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600">
                    Filter by event type to focus on specific clinical activities
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Relative Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600">
                    Displays "2h ago", "5d ago" for quick scanning. Hover for full timestamp
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Expandable Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-600">
                    Click expand button to view detailed clinical information inline
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
