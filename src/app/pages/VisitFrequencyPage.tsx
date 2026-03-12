/**
 * Visit Frequency Management Page
 * 
 * Demo page showing visit frequency tracking and compliance monitoring
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  Info,
  Check,
  FileText,
  Download,
} from 'lucide-react';
import VisitFrequencyManagement from '../components/VisitFrequencyManagement';

export default function VisitFrequencyPage() {
  const navigate = useNavigate();

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
                <h1 className="text-xl font-bold text-gray-900">Visit Frequency Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • Admission #12345
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="frequencies">
          <TabsList>
            <TabsTrigger value="frequencies">
              <Calendar className="w-4 h-4 mr-2" />
              Visit Frequencies
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Frequencies Tab */}
          <TabsContent value="frequencies" className="mt-6">
            <VisitFrequencyManagement />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Visit Frequency Management Features</h3>

              <div className="space-y-6">
                {/* Frequency Codes */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Frequency Code Format</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Frequencies are expressed in standard format: <strong>[Visits]W[Weeks]</strong>
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>SN 2W4</strong> = Skilled Nursing, 2 visits per week for 4 weeks (8 total visits)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>PT 3W6</strong> = Physical Therapy, 3 visits per week for 6 weeks (18 total visits)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>OT 2W3</strong> = Occupational Therapy, 2 visits per week for 3 weeks (6 total visits)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>ST 1W2</strong> = Speech Therapy, 1 visit per week for 2 weeks (2 total visits)</span>
                    </li>
                  </ul>
                </div>

                {/* Visit Tracking */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Visit Tracking Metrics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <FeatureBox
                      title="Ordered Frequency"
                      description="Visits per week and duration from physician order"
                    />
                    <FeatureBox
                      title="Scheduled Visits"
                      description="Number of visits currently scheduled (upcoming)"
                    />
                    <FeatureBox
                      title="Completed Visits"
                      description="Number of visits already performed"
                    />
                    <FeatureBox
                      title="Remaining Expected"
                      description="Visits still needed to meet ordered frequency"
                    />
                    <FeatureBox
                      title="Expected to Date"
                      description="Visits expected based on time elapsed"
                    />
                    <FeatureBox
                      title="Variance"
                      description="Difference between expected and actual completions"
                    />
                  </div>
                </div>

                {/* Compliance Status */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Compliance Status Levels</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <strong className="text-green-900">On Track</strong>
                        <p className="text-xs text-gray-700">Within ±10% of expected visits</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                      <Check className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <strong className="text-blue-900">Ahead</strong>
                        <p className="text-xs text-gray-700">More than 10% ahead of expected pace</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded">
                      <Check className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <strong className="text-amber-900">Behind</strong>
                        <p className="text-xs text-gray-700">10-30% behind expected pace</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded">
                      <Check className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <strong className="text-red-900">Critical</strong>
                        <p className="text-xs text-gray-700">More than 30% behind expected pace</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Alert Types */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Automated Alerts (8 Types)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Under-Scheduled', desc: 'Not enough scheduled visits to meet frequency' },
                      { name: 'Over-Scheduled', desc: 'More visits scheduled than ordered' },
                      { name: 'Behind Schedule', desc: 'Fewer completions than expected to date' },
                      { name: 'Expiring Soon', desc: 'Frequency order expiring within 1 week' },
                      { name: 'Expired', desc: 'Frequency order has expired, needs renewal' },
                      { name: 'Needs Renewal', desc: 'Approaching end, may need new order' },
                      { name: 'Missed Visits', desc: 'Has cancelled or missed visits' },
                      { name: 'Over-Utilization', desc: 'Exceeded total ordered visits' },
                    ].map((alert, idx) => (
                      <div key={idx} className="p-2 border border-gray-200 rounded">
                        <p className="font-medium text-xs text-gray-900">{alert.name}</p>
                        <p className="text-xs text-gray-600">{alert.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mismatch Detection */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mismatch Detection</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Scheduled vs Expected:</strong> Alerts if not enough visits scheduled</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Completed vs Expected:</strong> Tracks if behind pace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Total vs Ordered:</strong> Prevents over-utilization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Time-based:</strong> Calculates expected visits based on weeks elapsed</span>
                    </li>
                  </ul>
                </div>

                {/* Use Cases */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Use Cases</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Schedulers:</strong> Know how many visits to schedule for each discipline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Clinicians:</strong> See if they're on track with ordered frequency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Care Coordinators:</strong> Monitor compliance across all disciplines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Managers:</strong> Identify patients at risk of under/over-utilization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span><strong>Billing:</strong> Ensure visits are within authorized frequency for reimbursement</span>
                    </li>
                  </ul>
                </div>

                {/* Overall Compliance Dashboard */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Overall Compliance Dashboard</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Overall compliance percentage across all disciplines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Count of disciplines: On Track, Behind, Critical</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Total active alerts across all frequencies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Visual progress bar for at-a-glance status</span>
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
function FeatureBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <h5 className="font-medium text-sm text-gray-900 mb-1">{title}</h5>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}
