/**
 * Medication Timeline Demo Page
 * 
 * Demonstrates the medication timeline component with integration examples.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Clock,
  Pill,
  TrendingUp,
  FileText,
  BarChart3,
  Download,
} from 'lucide-react';
import MedicationTimeline from '../components/MedicationTimeline';
import {
  MOCK_MEDICATION_EVENTS,
  medicationTimelineService,
  MEDICATION_EVENT_CONFIG,
} from '../services/medicationTimeline';

export default function MedicationTimelineDemo() {
  const navigate = useNavigate();
  const [events] = useState(MOCK_MEDICATION_EVENTS);

  const stats = medicationTimelineService.getEventStats(events);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  Medication Timeline
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • Admission #12345
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard
                icon={FileText}
                label="Total Events"
                value={stats.total}
                color="blue"
              />
              <StatCard
                icon={Pill}
                label="Medications"
                value={Object.keys(stats.byMedication).length}
                color="green"
              />
              <StatCard
                icon={TrendingUp}
                label="Changes"
                value={
                  (stats.byType['dose-changed'] || 0) +
                  (stats.byType['frequency-changed'] || 0) +
                  (stats.byType['route-changed'] || 0)
                }
                color="orange"
              />
              <StatCard
                icon={BarChart3}
                label="Reconciliations"
                value={stats.byType['reconciliation-completed'] || 0}
                color="purple"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">
                  <Clock className="w-4 h-4 mr-2" />
                  Timeline View
                </TabsTrigger>
                <TabsTrigger value="integration">
                  <FileText className="w-4 h-4 mr-2" />
                  Integration Examples
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-6">
                <MedicationTimeline
                  events={events}
                  showFilters={true}
                  maxHeight="calc(100vh - 400px)"
                />
              </TabsContent>

              <TabsContent value="integration" className="mt-6 space-y-6">
                <IntegrationExample
                  title="Patient Chart - Medication Section"
                  description="Timeline appears in the medications section of the patient chart, showing recent events."
                >
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Medication Events</h3>
                    <MedicationTimeline
                      events={events.slice(0, 3)}
                      showFilters={false}
                      compact={true}
                    />
                  </Card>
                </IntegrationExample>

                <IntegrationExample
                  title="Admission Dashboard"
                  description="Quick overview of medication events during the current admission."
                >
                  <Card className="p-6 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-blue-900">Medication Activity</h3>
                      <Badge className="bg-blue-600 text-white">
                        {events.length} events
                      </Badge>
                    </div>
                    <MedicationTimeline
                      events={events.slice(0, 5)}
                      showFilters={false}
                      compact={true}
                    />
                  </Card>
                </IntegrationExample>

                <IntegrationExample
                  title="Clinical Documentation"
                  description="Timeline helps clinicians understand medication context when documenting."
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <Label className="text-sm font-medium mb-2 block">
                          Medication Review Notes
                        </Label>
                        <Textarea
                          placeholder="Document medication review..."
                          rows={3}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-medium mb-2 block">
                          Recent Changes
                        </Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {events.slice(0, 3).map(event => {
                            const config = MEDICATION_EVENT_CONFIG[event.type];
                            return (
                              <div key={event.id} className="text-xs p-2 bg-gray-50 rounded">
                                <Badge className={cn('text-xs mb-1', config.badgeColor)}>
                                  {config.label}
                                </Badge>
                                <p className="text-gray-700">{event.medicationName}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>
                </IntegrationExample>

                <IntegrationExample
                  title="Care Transition Summary"
                  description="Timeline included in discharge or transfer summaries for continuity of care."
                >
                  <Card className="p-6 bg-gradient-to-br from-purple-50 to-white">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Medication Changes During Episode
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {stats.total} medication events recorded during this admission
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-2 bg-white rounded border">
                        <p className="text-gray-600 mb-1">Added</p>
                        <p className="text-lg font-bold text-green-600">
                          {stats.byType['medication-added'] || 0}
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <p className="text-gray-600 mb-1">Modified</p>
                        <p className="text-lg font-bold text-orange-600">
                          {(stats.byType['dose-changed'] || 0) +
                            (stats.byType['frequency-changed'] || 0) +
                            (stats.byType['strength-changed'] || 0)}
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded border">
                        <p className="text-gray-600 mb-1">Discontinued</p>
                        <p className="text-lg font-bold text-red-600">
                          {stats.byType['medication-discontinued'] || 0}
                        </p>
                      </div>
                    </div>
                  </Card>
                </IntegrationExample>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Episode Info */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="font-semibold text-gray-900 mb-4">Episode Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Admission Date</div>
                  <div className="font-medium text-gray-900">March 1, 2024</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Episode Duration</div>
                  <div className="font-medium text-gray-900">12 days</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Primary Diagnosis</div>
                  <div className="font-medium text-gray-900">CHF Exacerbation</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Attending Physician</div>
                  <div className="font-medium text-gray-900">Dr. Sarah Johnson</div>
                </div>
              </div>
            </Card>

            {/* Event Type Breakdown */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Event Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(stats.byType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const config = MEDICATION_EVENT_CONFIG[type as keyof typeof MEDICATION_EVENT_CONFIG];
                    if (!config) return null;
                    return (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{config.label}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })}
              </div>
            </Card>

            {/* Medications Affected */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Medications Affected</h3>
              <div className="space-y-2">
                {Object.entries(stats.byMedication)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([med, count]) => (
                    <div key={med} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate flex-1">{med}</span>
                      <Badge variant="outline" className="ml-2">{count}</Badge>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Related Pages */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Related Pages</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/patient-medication-profile-view')}
                >
                  Current Medications
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/medication-reconciliation-workflow')}
                >
                  Reconciliation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/medication-alerts-demo')}
                >
                  Medication Alerts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/medication-change-tracking')}
                >
                  Change Tracking
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colorConfig = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
  };

  return (
    <Card className={cn('p-4', colorConfig[color])}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5" />
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs opacity-80">{label}</div>
        </div>
      </div>
    </Card>
  );
}

function IntegrationExample({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

function Label({ children, className, ...props }: any) {
  return (
    <label className={cn('text-sm font-medium text-gray-700', className)} {...props}>
      {children}
    </label>
  );
}

function Textarea({ className, ...props }: any) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        className
      )}
      {...props}
    />
  );
}
