/**
 * Clinical Control Center Demo Page
 * 
 * Demonstrates the clinical summary cards system with full dashboard integration
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Activity,
  Info,
  Check,
  Pill,
  Target,
  Calendar,
  FileText,
  ClipboardCheck,
  AlertCircle,
} from 'lucide-react';
import ClinicalControlCenter from '../components/ClinicalControlCenter';
import ClinicalSummaryCard from '../components/ClinicalSummaryCard';
import {
  generateMedicationSummaryCard,
  generateCarePlanSummaryCard,
  generateFrequencySummaryCard,
  generateWoundSummaryCard,
  generateAssessmentSummaryCard,
  generateDocumentationSummaryCard,
} from '../services/clinicalSummaryCards';

export default function ClinicalControlCenterPage() {
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
                <h1 className="text-xl font-bold text-gray-900">Clinical Control Center</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive clinical summary dashboard with reusable cards
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
              <Activity className="w-4 h-4 mr-2" />
              Control Center
            </TabsTrigger>
            <TabsTrigger value="individual">
              <FileText className="w-4 h-4 mr-2" />
              Individual Cards
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <ClinicalControlCenter
              admissionId="ADM-12345"
              patientName="Margaret Johnson"
              onRefresh={() => {
                console.log('Refreshing dashboard...');
              }}
            />
          </TabsContent>

          {/* Individual Cards Tab */}
          <TabsContent value="individual" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Individual Card Examples</h3>
              <p className="text-sm text-gray-600 mb-6">
                Each card type shown individually for detailed review
              </p>

              <div className="space-y-8">
                {/* Medication Card */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Medication Summary Card</h4>
                  </div>
                  <div className="max-w-md">
                    <ClinicalSummaryCard data={generateMedicationSummaryCard('ADM-12345')} />
                  </div>
                </div>

                {/* Care Plan Card */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Care Plan Summary Card</h4>
                  </div>
                  <div className="max-w-md">
                    <ClinicalSummaryCard data={generateCarePlanSummaryCard('ADM-12345')} />
                  </div>
                </div>

                {/* Frequency Card */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Frequency Summary Card</h4>
                  </div>
                  <div className="max-w-md">
                    <ClinicalSummaryCard data={generateFrequencySummaryCard('ADM-12345')} />
                  </div>
                </div>

                {/* Wound Card */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-red-600" />
                    <h4 className="font-semibold text-gray-900">Wound Summary Card</h4>
                  </div>
                  <div className="max-w-md">
                    <ClinicalSummaryCard data={generateWoundSummaryCard('ADM-12345')} />
                  </div>
                </div>

                {/* Assessment Card */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardCheck className="w-5 h-5 text-amber-600" />
                    <h4 className="font-semibold text-gray-900">Assessment Summary Card</h4>
                  </div>
                  <div className="max-w-md">
                    <ClinicalSummaryCard data={generateAssessmentSummaryCard('ADM-12345')} />
                  </div>
                </div>

                {/* Documentation Card */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Documentation Summary Card</h4>
                  </div>
                  <div className="max-w-md">
                    <ClinicalSummaryCard data={generateDocumentationSummaryCard('ADM-12345')} />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Clinical Summary Cards System</h3>

              <div className="space-y-6">
                {/* Overview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">System Overview</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    A reusable set of clinical summary cards that transform the admission dashboard
                    into a true clinical control center. Each card provides at-a-glance insights
                    into a specific clinical domain with actionable data and quick access to
                    detailed modules.
                  </p>
                </div>

                {/* Card Types */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">6 Card Types</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: <Pill className="w-5 h-5 text-purple-600" />,
                        title: 'Medication Summary',
                        color: '#7C3AED',
                        features: [
                          'Active medications count',
                          'Recent changes tracking',
                          'PRN medications',
                          'Allergy alerts',
                          'Drug interaction warnings',
                        ],
                      },
                      {
                        icon: <Target className="w-5 h-5 text-green-600" />,
                        title: 'Care Plan Summary',
                        color: '#10B981',
                        features: [
                          'Active goals count',
                          'Average progress percentage',
                          'Interventions count',
                          'Multi-discipline coordination',
                          'Goal review reminders',
                        ],
                      },
                      {
                        icon: <Calendar className="w-5 h-5 text-blue-600" />,
                        title: 'Frequency Summary',
                        color: '#3B82F6',
                        features: [
                          'Ordered vs completed visits',
                          'Compliance percentage',
                          'Upcoming scheduled visits',
                          'Missed visits tracking',
                          'Behind schedule alerts',
                        ],
                      },
                      {
                        icon: <Activity className="w-5 h-5 text-red-600" />,
                        title: 'Wound Summary',
                        color: '#EF4444',
                        features: [
                          'Active wounds count',
                          'Healing vs worsening trends',
                          'Size change percentages',
                          'Last assessment date',
                          'Deterioration alerts',
                        ],
                      },
                      {
                        icon: <ClipboardCheck className="w-5 h-5 text-amber-600" />,
                        title: 'Assessment Summary',
                        color: '#F59E0B',
                        features: [
                          'Total assessments',
                          'Overdue count',
                          'Due soon (next 7 days)',
                          'Completed count',
                          'OASIS tracking',
                        ],
                      },
                      {
                        icon: <FileText className="w-5 h-5 text-purple-600" />,
                        title: 'Documentation Summary',
                        color: '#8B5CF6',
                        features: [
                          'Total documents',
                          'Incomplete documentation',
                          'Pending cosignatures',
                          'Completion percentage',
                          'Time-sensitive alerts',
                        ],
                      },
                    ].map((cardType, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${cardType.color}20` }}
                          >
                            {cardType.icon}
                          </div>
                          <h5 className="font-semibold text-gray-900">{cardType.title}</h5>
                        </div>
                        <ul className="space-y-1">
                          {cardType.features.map((feature, i) => (
                            <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                              <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Components */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Card Components (4 Sections)</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Key Metrics (4 per card):</strong>
                        <p className="text-sm text-gray-700">
                          2x2 grid of primary statistics with icons, values, subtexts, and trend indicators
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Status Banner:</strong>
                        <p className="text-sm text-gray-700">
                          Color-coded status (success/warning/error/info) with descriptive message
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Warnings List:</strong>
                        <p className="text-sm text-gray-700">
                          Severity-based warnings (critical/high/medium) with counts and messages
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Quick Actions (2 per card):</strong>
                        <p className="text-sm text-gray-700">
                          Primary and secondary action buttons for navigation to detailed modules
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Health Score System */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Admission Health Score</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-3">
                      Algorithmic score (0-100) calculated from all card statuses and warnings
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-green-50 rounded border border-green-300">
                        <p className="text-2xl font-bold text-green-600">90+</p>
                        <p className="text-xs text-green-900">Excellent</p>
                        <p className="text-xs text-green-700 mt-1">Minimal issues</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded border border-blue-300">
                        <p className="text-2xl font-bold text-blue-600">75-89</p>
                        <p className="text-xs text-blue-900">Good</p>
                        <p className="text-xs text-blue-700 mt-1">Minor issues</p>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded border border-amber-300">
                        <p className="text-2xl font-bold text-amber-600">60-74</p>
                        <p className="text-xs text-amber-900">Fair</p>
                        <p className="text-xs text-amber-700 mt-1">Needs attention</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded border border-red-300">
                        <p className="text-2xl font-bold text-red-600">&lt;60</p>
                        <p className="text-xs text-red-900">Poor</p>
                        <p className="text-xs text-red-700 mt-1">Critical issues</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Control Center Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Health Score Banner:</strong>
                        <p className="text-sm text-gray-700">
                          Circular progress indicator with 4-level classification and statistics
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Filter Controls:</strong>
                        <p className="text-sm text-gray-700">
                          Toggle between "All Cards" and "Critical Only" views
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Card Visibility Toggles:</strong>
                        <p className="text-sm text-gray-700">
                          Show/hide individual card types to focus on specific domains
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Responsive Grid:</strong>
                        <p className="text-sm text-gray-700">
                          3-column layout on desktop, 2-column on tablet, 1-column on mobile
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Refresh Capability:</strong>
                        <p className="text-sm text-gray-700">
                          Manual refresh button to update all card data
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Visual Design */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Visual Design Elements</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Color Coding</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Each card type has unique brand color</li>
                        <li>• Status banners use semantic colors</li>
                        <li>• Warnings have severity-based colors</li>
                        <li>• Trend indicators (red up, green down)</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Icons</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Card header icon with color background</li>
                        <li>• Metric icons for visual scanning</li>
                        <li>• Status/warning icons for severity</li>
                        <li>• Action button icons</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Typography</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Bold titles for hierarchy</li>
                        <li>• Large metric values (2xl)</li>
                        <li>• Small subtexts for context</li>
                        <li>• Consistent spacing</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Interactions</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Hover shadow on cards</li>
                        <li>• Quick action button clicks</li>
                        <li>• Card visibility toggles</li>
                        <li>• Filter mode switching</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Clinical Use Cases</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Care Coordinators:</strong>
                        <p className="text-sm text-gray-700">
                          Single-screen overview of entire admission status for daily management
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Clinicians:</strong>
                        <p className="text-sm text-gray-700">
                          Quick access to critical patient information before/between visits
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Supervisors:</strong>
                        <p className="text-sm text-gray-700">
                          Health score monitoring for quality oversight and intervention planning
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Handoff Communication:</strong>
                        <p className="text-sm text-gray-700">
                          Comprehensive status summary for shift changes or case transfers
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Integration Points */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Module Integration</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Medication Management', route: '/patient-medication-profile-view' },
                      { label: 'Care Plan Management', route: '/care-plan-management' },
                      { label: 'Visit Frequency', route: '/frequency-compliance-tracker' },
                      { label: 'Wound Care Tracking', route: '/wound-care-tracking' },
                      { label: 'Assessment Workspace', route: '/assessment-workspace' },
                      { label: 'Clinical Documentation', route: '/clinical-documentation-workspace' },
                      { label: 'Scheduling', route: '/scheduling' },
                      { label: 'Cosign Queue', route: '/cosign-queue' },
                      { label: 'OASIS Assessment', route: '/oasis-assessment-editor-improved' },
                    ].map((module, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-2">
                        <p className="text-xs font-medium text-gray-900">{module.label}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{module.route}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
