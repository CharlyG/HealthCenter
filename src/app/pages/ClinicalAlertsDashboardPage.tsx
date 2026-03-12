/**
 * Clinical Alerts Dashboard Demo Page
 * 
 * Demonstrates the clinical alerts dashboard with comprehensive alert management
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  AlertCircle,
  Info,
  Check,
} from 'lucide-react';
import ClinicalAlertsDashboard from '../components/ClinicalAlertsDashboard';

export default function ClinicalAlertsDashboardPage() {
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
                <h1 className="text-xl font-bold text-gray-900">Clinical Alerts Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • Admission #12345
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
              <AlertCircle className="w-4 h-4 mr-2" />
              Alerts Dashboard
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <ClinicalAlertsDashboard />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Clinical Alerts Dashboard Features</h3>

              <div className="space-y-6">
                {/* Alert Categories */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Alert Categories (10 Types)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        name: 'Medication Alerts',
                        color: '#7C3AED',
                        items: ['Drug interactions', 'Allergy conflicts', 'Duplicate therapy', 'Dosage exceeded'],
                      },
                      {
                        name: 'Fall Risk',
                        color: '#F59E0B',
                        items: ['High risk patients', 'Morse Fall Scale >45', 'Prevention protocols', 'Safety measures'],
                      },
                      {
                        name: 'Wound Deterioration',
                        color: '#EF4444',
                        items: ['Increasing wound size', 'Signs of infection', 'Not assessed recently', 'Treatment changes'],
                      },
                      {
                        name: 'Missed Visit Patterns',
                        color: '#3B82F6',
                        items: ['Multiple missed visits', 'Behind frequency', 'Not visited recently', 'Compliance issues'],
                      },
                      {
                        name: 'Incomplete Documentation',
                        color: '#10B981',
                        items: ['Visit notes incomplete', 'Missing sections', 'Pending cosign', 'Time limits'],
                      },
                      {
                        name: 'Unsigned Orders',
                        color: '#EC4899',
                        items: ['Verbal orders unsigned', 'Expiring orders', '48-hour rule', 'Physician signature needed'],
                      },
                      {
                        name: 'Assessment Due Items',
                        color: '#06B6D4',
                        items: ['OASIS overdue', 'Recertification due', 'Pain reassessment', 'Follow-up required'],
                      },
                      {
                        name: 'Clinical Changes',
                        color: '#F97316',
                        items: ['Status deterioration', 'Vital sign changes', 'Symptom escalation', 'Hospital readmission risk'],
                      },
                      {
                        name: 'Safety Issues',
                        color: '#DC2626',
                        items: ['Home safety hazards', 'Equipment failures', 'Infection control', 'Emergency situations'],
                      },
                      {
                        name: 'Compliance Alerts',
                        color: '#8B5CF6',
                        items: ['Regulatory deadlines', 'Documentation gaps', 'Visit frequency', 'Quality measures'],
                      },
                    ].map((category, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <h5 className="font-medium text-sm text-gray-900">{category.name}</h5>
                        </div>
                        <ul className="space-y-1">
                          {category.items.map((item, i) => (
                            <li key={i} className="text-xs text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severity Levels */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Severity Levels (4 Types)</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="border-l-4 border-l-red-500 bg-red-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <strong className="text-red-900">Critical</strong>
                      </div>
                      <p className="text-xs text-red-700">Requires immediate action</p>
                      <p className="text-xs text-red-600 mt-1">• Patient safety risk</p>
                      <p className="text-xs text-red-600">• Regulatory violation</p>
                      <p className="text-xs text-red-600">• Payment at risk</p>
                    </div>
                    <div className="border-l-4 border-l-amber-500 bg-amber-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <strong className="text-amber-900">High</strong>
                      </div>
                      <p className="text-xs text-amber-700">Urgent attention needed</p>
                      <p className="text-xs text-amber-600 mt-1">• Clinical concern</p>
                      <p className="text-xs text-amber-600">• Time-sensitive</p>
                      <p className="text-xs text-amber-600">• Quality impact</p>
                    </div>
                    <div className="border-l-4 border-l-blue-500 bg-blue-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Info className="w-4 h-4 text-blue-600" />
                        <strong className="text-blue-900">Medium</strong>
                      </div>
                      <p className="text-xs text-blue-700">Address soon</p>
                      <p className="text-xs text-blue-600 mt-1">• Important follow-up</p>
                      <p className="text-xs text-blue-600">• Process improvement</p>
                      <p className="text-xs text-blue-600">• Documentation gap</p>
                    </div>
                    <div className="border-l-4 border-l-gray-400 bg-gray-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Info className="w-4 h-4 text-gray-600" />
                        <strong className="text-gray-900">Low</strong>
                      </div>
                      <p className="text-xs text-gray-700">For awareness</p>
                      <p className="text-xs text-gray-600 mt-1">• Informational</p>
                      <p className="text-xs text-gray-600">• Non-urgent</p>
                      <p className="text-xs text-gray-600">• Monitoring</p>
                    </div>
                  </div>
                </div>

                {/* Alert Components */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Alert Display Components</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Severity Badge:</strong>
                        <p className="text-sm text-gray-700">Color-coded severity level with icon (Critical/High/Medium/Low)</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Description:</strong>
                        <p className="text-sm text-gray-700">Clear explanation of the clinical issue and current status</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Context Panel:</strong>
                        <p className="text-sm text-gray-700">Related patient/admission context (visit date, discipline, document type, assessment type)</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Suggested Action:</strong>
                        <p className="text-sm text-gray-700">Clinical guidance on how to address the alert</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Quick Action Buttons:</strong>
                        <p className="text-sm text-gray-700">1-click actions to navigate to relevant screens or perform common tasks</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Time Stamp:</strong>
                        <p className="text-sm text-gray-700">When alert was detected (e.g., "2h ago", "3d ago")</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Patient Context:</strong>
                        <p className="text-sm text-gray-700">Patient name and admission ID prominently displayed</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Quick Action Types</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Review Medications', desc: 'Navigate to medication profile' },
                      { label: 'Contact Physician', desc: 'Initiate communication workflow' },
                      { label: 'View Wound Details', desc: 'Open wound tracking module' },
                      { label: 'View Schedule', desc: 'Navigate to scheduling calendar' },
                      { label: 'Contact Patient', desc: 'Call or message patient' },
                      { label: 'Complete Documentation', desc: 'Open documentation editor' },
                      { label: 'View Order', desc: 'Review physician order' },
                      { label: 'Start Assessment', desc: 'Begin assessment workflow' },
                      { label: 'Acknowledge', desc: 'Mark as acknowledged' },
                      { label: 'Assign to Clinician', desc: 'Delegate task' },
                      { label: 'Schedule Visit', desc: 'Add visit to calendar' },
                      { label: 'Send Reminder', desc: 'Notify responsible party' },
                    ].map((action, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-2">
                        <p className="font-medium text-xs text-gray-900">{action.label}</p>
                        <p className="text-xs text-gray-600">{action.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Dashboard Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Summary Statistics:</strong>
                        <p className="text-sm text-gray-700">Total alerts, Critical count, High priority count, Medium count, Acknowledged count</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Search Functionality:</strong>
                        <p className="text-sm text-gray-700">Search across title, description, and suggested action</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Multi-Filter System:</strong>
                        <p className="text-sm text-gray-700">Filter by severity (4 levels), category (10 types), status (4 states)</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Priority Sorting:</strong>
                        <p className="text-sm text-gray-700">Alerts sorted by severity (critical first) then by detection time (newest first)</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Visual Indicators:</strong>
                        <p className="text-sm text-gray-700">Color-coded left borders, category icons, severity badges, status badges</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Acknowledgment Tracking:</strong>
                        <p className="text-sm text-gray-700">Shows who acknowledged and when, reduces opacity for acknowledged alerts</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Integration Points */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Clinical Module Integration</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Medication Management</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Drug interaction detection</li>
                        <li>• Allergy conflict alerts</li>
                        <li>• Duplicate therapy warnings</li>
                        <li>• Links to medication profile</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Wound Care Tracking</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Deterioration detection</li>
                        <li>• Infection alerts</li>
                        <li>• Assessment frequency monitoring</li>
                        <li>• Links to wound details</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Visit Frequency</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Missed visit tracking</li>
                        <li>• Behind schedule alerts</li>
                        <li>• Compliance monitoring</li>
                        <li>• Links to scheduling</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Documentation</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Incomplete note detection</li>
                        <li>• Cosign pending tracking</li>
                        <li>• Time limit enforcement</li>
                        <li>• Links to documentation editor</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Assessment Engine</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• OASIS overdue alerts</li>
                        <li>• Recertification reminders</li>
                        <li>• Follow-up assessments</li>
                        <li>• Links to assessment workspace</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Orders Management</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Unsigned order tracking</li>
                        <li>• Expiration warnings</li>
                        <li>• 48-hour rule enforcement</li>
                        <li>• Links to verbal orders</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Use Cases</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Care Coordinators:</strong>
                        <p className="text-sm text-gray-700">Monitor all clinical alerts across caseload, prioritize interventions, ensure timely resolution</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Clinicians:</strong>
                        <p className="text-sm text-gray-700">Quickly identify patient safety issues before visits, address clinical concerns proactively</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Supervisors:</strong>
                        <p className="text-sm text-gray-700">Track team compliance, identify systemic issues, ensure documentation standards</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Quality Team:</strong>
                        <p className="text-sm text-gray-700">Monitor regulatory compliance, track quality metrics, prevent adverse events</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Billing Department:</strong>
                        <p className="text-sm text-gray-700">Ensure documentation complete for billing, track unsigned orders affecting claims</p>
                      </div>
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
