/**
 * Enhanced Visit Preparation Demo Page
 * 
 * Demonstrates the enhanced visit preparation panel with integrated clinical data
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Info,
  Check,
  Pill,
  Target,
  AlertCircle,
  Activity,
  User,
} from 'lucide-react';
import EnhancedVisitPreparationPanel from '../components/EnhancedVisitPreparationPanel';

export default function EnhancedVisitPreparationPage() {
  const navigate = useNavigate();
  const [selectedDiscipline, setSelectedDiscipline] = useState<'SN' | 'PT' | 'OT' | 'ST' | 'MSW' | 'HHA'>('SN');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Enhanced Visit Preparation</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive pre-visit briefing with integrated clinical data
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="panel">
          <TabsList>
            <TabsTrigger value="panel">
              <Calendar className="w-4 h-4 mr-2" />
              Visit Preparation
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Panel Tab */}
          <TabsContent value="panel" className="mt-6">
            {/* Discipline Selector */}
            <Card className="p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Discipline:</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'SN', label: 'Skilled Nursing' },
                  { code: 'PT', label: 'Physical Therapy' },
                  { code: 'OT', label: 'Occupational Therapy' },
                  { code: 'ST', label: 'Speech Therapy' },
                  { code: 'MSW', label: 'Medical Social Work' },
                  { code: 'HHA', label: 'Home Health Aide' },
                ].map(({ code, label }) => (
                  <Button
                    key={code}
                    variant={selectedDiscipline === code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDiscipline(code as any)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Card>

            {/* Enhanced Panel */}
            <EnhancedVisitPreparationPanel
              visitId="VST-12345"
              patientId="PAT-12345"
              admissionId="ADM-12345"
              discipline={selectedDiscipline}
              onStartVisit={() => {
                alert('Starting visit for ' + selectedDiscipline);
                navigate('/visit-execution-screen-demo');
              }}
            />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Enhanced Visit Preparation Features</h3>

              <div className="space-y-6">
                {/* Overview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Comprehensive Pre-Visit Briefing</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    All critical clinical information integrated from multiple modules into a single preparation screen.
                    Helps clinicians walk into the visit fully prepared with context, alerts, and priorities.
                  </p>
                </div>

                {/* Sections */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">7 Integrated Sections</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        icon: <User className="w-5 h-5 text-blue-600" />,
                        title: '1. Patient Summary',
                        items: [
                          'Demographics (name, age, gender, MRN)',
                          'Primary & secondary diagnoses',
                          'Allergies with severity levels',
                          'Contact information',
                          'Quick actions: Call patient, Get directions',
                        ],
                      },
                      {
                        icon: <Pill className="w-5 h-5 text-purple-600" />,
                        title: '2. Medication Snapshot',
                        items: [
                          'Recent medication changes highlighted (NEW/CHANGED/D/C)',
                          'Change dates and reasons',
                          'Active medications list (top 5 + view all)',
                          'Dosage, route, and frequency',
                          'Integration with Medication Management module',
                        ],
                      },
                      {
                        icon: <Target className="w-5 h-5 text-green-600" />,
                        title: '3. Care Plan Goals (Discipline-Specific)',
                        items: [
                          'Filtered by current discipline',
                          'Problem statement + goal statement',
                          'Progress percentage with visual bar',
                          'Status indicators (active/achieved/discontinued)',
                          'Key interventions for each goal',
                          'Multi-discipline coordination',
                        ],
                      },
                      {
                        icon: <AlertCircle className="w-5 h-5 text-red-600" />,
                        title: '4. Outstanding Clinical Alerts',
                        items: [
                          'Critical and high priority alerts only',
                          'Severity-based color coding',
                          'Alert description and context',
                          'Suggested actions',
                          'Integration with Clinical Alerts Dashboard',
                        ],
                      },
                      {
                        icon: <Activity className="w-5 h-5 text-orange-600" />,
                        title: '5. Recent Wound Updates',
                        items: [
                          'Active wounds only',
                          'Location and type',
                          'Current status (healing/stable/worsening)',
                          'Latest measurements (size, drainage)',
                          'Trend indicators (% change from previous)',
                          'Last assessment date',
                          'Integration with Wound Care Tracking',
                        ],
                      },
                      {
                        icon: <Calendar className="w-5 h-5 text-blue-600" />,
                        title: '6. Frequency Compliance Warnings',
                        items: [
                          'Discipline-specific frequency tracking',
                          'Ordered vs Scheduled vs Completed vs Missed',
                          'Status indicators (on-track/ahead/behind/critical)',
                          'Visual metrics grid',
                          'Actionable messages',
                          'Integration with Visit Frequency Management',
                        ],
                      },
                      {
                        icon: <Check className="w-5 h-5 text-green-600" />,
                        title: '7. Visit Tasks Checklist',
                        items: [
                          'Discipline-specific tasks',
                          'Common tasks for all disciplines',
                          'Required vs optional indicators',
                          'Task categories (observation/intervention/education/assessment)',
                          'Interactive checkboxes',
                          'Progress counter',
                        ],
                      },
                    ].map((section, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {section.icon}
                          </div>
                          <h5 className="font-semibold text-gray-900">{section.title}</h5>
                        </div>
                        <ul className="space-y-1">
                          {section.items.map((item, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Alerts Banner */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Critical Alerts Banner</h4>
                  <div className="border-2 border-amber-500 bg-amber-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                      <div>
                        <h5 className="font-bold text-amber-900 mb-2">Action Required Before Visit</h5>
                        <ul className="space-y-1 text-sm text-amber-800">
                          <li>• Shows aggregate count of critical issues</li>
                          <li>• Medication changes requiring awareness</li>
                          <li>• Active wounds to assess</li>
                          <li>• Frequency compliance warnings</li>
                          <li>• Appears only when issues exist</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* UX Features */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">User Experience Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Collapsible Sections:</strong>
                        <p className="text-sm text-gray-700">Each section can be expanded/collapsed for focused review</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Badge Indicators:</strong>
                        <p className="text-sm text-gray-700">Visual badges show count of items requiring attention</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Color Coding:</strong>
                        <p className="text-sm text-gray-700">Severity-based colors (red=critical, amber=warning, blue=info)</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Mobile-Optimized:</strong>
                        <p className="text-sm text-gray-700">Designed for field use on tablets and phones</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Sticky Start Button:</strong>
                        <p className="text-sm text-gray-700">Large "Start Visit" button always accessible at bottom</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Discipline-Aware:</strong>
                        <p className="text-sm text-gray-700">Content filtered and prioritized based on clinician's discipline</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Data Integration */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Module Integration Points</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Medication Management</h5>
                      <p className="text-xs text-gray-700">Active medications + recent changes from medication profile</p>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Care Plan Management</h5>
                      <p className="text-xs text-gray-700">Active goals filtered by discipline with progress tracking</p>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Clinical Alerts Dashboard</h5>
                      <p className="text-xs text-gray-700">Critical/high priority alerts requiring pre-visit review</p>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Wound Care Tracking</h5>
                      <p className="text-xs text-gray-700">Active wounds with latest assessments and trends</p>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Visit Frequency Management</h5>
                      <p className="text-xs text-gray-700">Compliance status with ordered frequency per discipline</p>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">Patient Demographics</h5>
                      <p className="text-xs text-gray-700">Basic patient info, diagnoses, allergies, contact details</p>
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
                        <strong className="text-gray-900">Pre-Visit Review:</strong>
                        <p className="text-sm text-gray-700">
                          Clinician reviews panel 5-10 minutes before visit to refresh memory and identify priorities
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Medication Safety:</strong>
                        <p className="text-sm text-gray-700">
                          Recent medication changes highlighted to ensure clinician is aware before assessment
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Focused Interventions:</strong>
                        <p className="text-sm text-gray-700">
                          Care plan goals guide visit activities specific to clinician's discipline
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Alert Response:</strong>
                        <p className="text-sm text-gray-700">
                          Critical alerts surfaced early allow clinician to prepare appropriate response
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Wound Management:</strong>
                        <p className="text-sm text-gray-700">
                          Wound status and trends help clinician bring appropriate supplies and anticipate care needs
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Visit Planning:</strong>
                        <p className="text-sm text-gray-700">
                          Task checklist ensures all required activities are completed during visit
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Benefits */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Clinical Benefits</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <h5 className="font-medium text-sm text-green-900 mb-1">Patient Safety</h5>
                      <p className="text-xs text-green-800">
                        Medication changes and allergies prominently displayed reduce adverse events
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <h5 className="font-medium text-sm text-blue-900 mb-1">Visit Quality</h5>
                      <p className="text-xs text-blue-800">
                        Comprehensive preparation enables focused, goal-oriented visits
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded p-3">
                      <h5 className="font-medium text-sm text-purple-900 mb-1">Efficiency</h5>
                      <p className="text-xs text-purple-800">
                        All needed information in one screen eliminates searching across modules
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <h5 className="font-medium text-sm text-amber-900 mb-1">Compliance</h5>
                      <p className="text-xs text-amber-800">
                        Frequency warnings and required tasks ensure regulatory adherence
                      </p>
                    </div>
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
