/**
 * Frequency Compliance Tracker Demo Page
 * 
 * Shows the tracker in different dashboard contexts
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  LayoutDashboard,
  Info,
  Check,
  Users,
  Calendar,
  Activity,
} from 'lucide-react';
import FrequencyComplianceTracker from '../components/FrequencyComplianceTracker';
import { getMockFrequencyTracking } from '../services/visitFrequency';
import { Badge } from '../components/ui/badge';

export default function FrequencyComplianceTrackerPage() {
  const navigate = useNavigate();
  const trackings = getMockFrequencyTracking();

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
                <h1 className="text-xl font-bold text-gray-900">Frequency Compliance Tracker</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Dashboard component for monitoring visit frequency compliance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard Views
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* Admission Dashboard Context */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Admission Dashboard Context
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Full tracker as it appears on admission detail page with all information
              </p>
              
              <FrequencyComplianceTracker
                trackings={trackings}
                admissionId="ADM-12345"
                onViewDetails={() => navigate('/visit-frequency')}
              />
            </Card>

            {/* Compact Widget */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Compact Widget (for Dashboard Sidebar)
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Minimal space version for sidebar or dashboard cards
              </p>
              
              <div className="max-w-sm">
                <FrequencyComplianceTracker
                  trackings={trackings}
                  compact
                  onViewDetails={() => navigate('/visit-frequency')}
                />
              </div>
            </Card>

            {/* Care Coordinator Dashboard */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Care Coordinator Dashboard
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Example showing multiple patient trackers
              </p>

              <div className="space-y-4">
                {/* Patient 1 */}
                <div className="border-l-4 border-l-red-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Margaret Johnson</h4>
                      <p className="text-xs text-gray-600">MRN-334455 • ADM-12345</p>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                      Critical
                    </Badge>
                  </div>
                  <FrequencyComplianceTracker
                    trackings={trackings}
                    showTitle={false}
                    compact
                  />
                </div>

                {/* Patient 2 */}
                <div className="border-l-4 border-l-amber-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Robert Wilson</h4>
                      <p className="text-xs text-gray-600">MRN-445566 • ADM-12346</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                      Behind
                    </Badge>
                  </div>
                  <FrequencyComplianceTracker
                    trackings={trackings.slice(0, 2)}
                    showTitle={false}
                    compact
                  />
                </div>

                {/* Patient 3 */}
                <div className="border-l-4 border-l-green-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Sarah Martinez</h4>
                      <p className="text-xs text-gray-600">MRN-556677 • ADM-12347</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      On Track
                    </Badge>
                  </div>
                  <FrequencyComplianceTracker
                    trackings={trackings.slice(0, 3).map(t => ({
                      ...t,
                      complianceStatus: 'on-track' as const,
                      alerts: [],
                    }))}
                    showTitle={false}
                    compact
                  />
                </div>
              </div>
            </Card>

            {/* Clinician Dashboard */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Clinician's My Patients Dashboard
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Shows frequency compliance for assigned patients
              </p>

              <div className="grid grid-cols-2 gap-4">
                <FrequencyComplianceTracker
                  trackings={trackings.slice(0, 1)}
                  showTitle={false}
                  compact
                />
                <FrequencyComplianceTracker
                  trackings={trackings.slice(1, 2)}
                  showTitle={false}
                  compact
                />
                <FrequencyComplianceTracker
                  trackings={trackings.slice(2, 3)}
                  showTitle={false}
                  compact
                />
                <FrequencyComplianceTracker
                  trackings={trackings.slice(0, 2)}
                  showTitle={false}
                  compact
                />
              </div>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Frequency Compliance Tracker Features</h3>

              <div className="space-y-6">
                {/* Comparison Metrics */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Visit Comparison Metrics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <FeatureBox
                      icon={<Calendar className="w-4 h-4 text-blue-600" />}
                      title="Ordered Visits"
                      description="Total visits ordered by physician per discipline"
                    />
                    <FeatureBox
                      icon={<Calendar className="w-4 h-4 text-purple-600" />}
                      title="Scheduled Visits"
                      description="Upcoming visits currently on the schedule"
                    />
                    <FeatureBox
                      icon={<Check className="w-4 h-4 text-green-600" />}
                      title="Completed Visits"
                      description="Visits performed and documented"
                    />
                    <FeatureBox
                      icon={<Activity className="w-4 h-4 text-red-600" />}
                      title="Missed Visits"
                      description="Cancelled or no-show visits requiring follow-up"
                    />
                  </div>
                </div>

                {/* View Modes */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">View Modes (3 Types)</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">Compact View</strong>
                        <p className="text-xs text-gray-700">Minimal space for dashboard widgets and sidebars</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">Overview Mode</strong>
                        <p className="text-xs text-gray-700">Summary statistics with discipline breakdown</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <strong className="text-gray-900">Detailed Mode</strong>
                        <p className="text-xs text-gray-700">Full details per discipline with alerts and metrics</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Visual Indicators */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Visual Compliance Indicators</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Color-coded borders:</strong> Left border changes color based on worst compliance status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Progress bars:</strong> Visual representation of completion percentage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Status badges:</strong> On Track, Behind, Critical indicators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Discipline pills:</strong> Compact representation with completion ratio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Alert icons:</strong> Warning triangles for issues requiring attention</span>
                    </li>
                  </ul>
                </div>

                {/* Warning System */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Warning System</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Behind Schedule:</strong> Shows when completed visits &lt; expected to date</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Under-Scheduled:</strong> Alerts when not enough visits scheduled</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Missed Visits:</strong> Highlights cancelled or no-show visits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Critical Status:</strong> {'>'}30% behind triggers critical alert</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Active Warnings:</strong> Summary section shows all current issues</span>
                    </li>
                  </ul>
                </div>

                {/* Overall Compliance */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Overall Compliance Calculation</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Formula:</strong> (Total Completed Visits / Total Expected to Date) × 100%
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      Expected to date is calculated based on weeks elapsed and ordered frequency per discipline
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-green-100 border border-green-300 rounded">
                        <strong className="text-green-900">≥90%</strong>
                        <p className="text-green-700">On Track (Green)</p>
                      </div>
                      <div className="p-2 bg-amber-100 border border-amber-300 rounded">
                        <strong className="text-amber-900">70-89%</strong>
                        <p className="text-amber-700">Behind (Amber)</p>
                      </div>
                      <div className="p-2 bg-red-100 border border-red-300 rounded">
                        <strong className="text-red-900">&lt;70%</strong>
                        <p className="text-red-700">Critical (Red)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Use Cases</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <strong className="text-sm text-gray-900">Care Coordinators</strong>
                      </div>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Monitor all patients at a glance</li>
                        <li>• Identify compliance issues early</li>
                        <li>• Prioritize interventions</li>
                        <li>• Track overall caseload health</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-purple-600" />
                        <strong className="text-sm text-gray-900">Clinicians</strong>
                      </div>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• See discipline-specific compliance</li>
                        <li>• Know if behind on visits</li>
                        <li>• Plan upcoming visit schedule</li>
                        <li>• Address missed visits</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <strong className="text-sm text-gray-900">Schedulers</strong>
                      </div>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• See under-scheduled disciplines</li>
                        <li>• Know how many visits to add</li>
                        <li>• Prevent scheduling gaps</li>
                        <li>• Ensure frequency compliance</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <LayoutDashboard className="w-4 h-4 text-amber-600" />
                        <strong className="text-sm text-gray-900">Managers</strong>
                      </div>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Track team performance</li>
                        <li>• Identify systemic issues</li>
                        <li>• Quality metrics reporting</li>
                        <li>• Resource allocation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Integration Points */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Dashboard Integration Points</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Admission Dashboard:</strong> Full tracker on patient detail page</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Care Coordinator Dashboard:</strong> Multi-patient compact view</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Clinician Dashboard:</strong> My patients grid view</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Scheduling Workspace:</strong> Widget showing patients needing visits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Manager Reports:</strong> Aggregated compliance metrics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Component
function FeatureBox({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode;
  title: string; 
  description: string;
}) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h5 className="font-medium text-sm text-gray-900">{title}</h5>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}