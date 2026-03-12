/**
 * Visit Preparation Panel Demo Page
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import VisitPreparationPanel from '../components/visit-preparation/VisitPreparationPanel';
import {
  Info,
  CheckCircle2,
  Stethoscope,
  User,
  Target,
  Activity,
  CheckSquare,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export default function VisitPreparationPanelDemoPage() {
  const [showLive, setShowLive] = useState(false);

  if (showLive) {
    return (
      <VisitPreparationPanel
        visitId="VST-001"
        onStartVisit={() => alert('Starting visit...')}
      />
    );
  }

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="size-8 text-blue-600" />
            Visit Preparation Panel
          </h1>
          <p className="text-gray-600 mt-2">
            Pre-visit briefing interface for clinicians to review patient information before beginning a visit
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Visit Preparation Panel</p>
                <p className="mt-1 text-blue-800">
                  The Visit Preparation Panel provides a <strong>comprehensive pre-visit briefing</strong> with 4 critical sections: Patient Summary (demographics, diagnosis, allergies, alerts), Care Plan Snapshot (goals, interventions, special instructions), Recent Clinical Activity (visits, orders, medications, hospitalizations), and Visit Tasks (checklist of observations, interventions, education, assessments). Designed for <strong>quick-scan review</strong> on mobile devices right before entering patient's home.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4 Pre-Visit Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectionCard
                number={1}
                icon={<User className="size-6 text-blue-600" />}
                title="Patient Summary"
                description="Essential patient information at a glance"
                features={[
                  'Patient demographics (name, age, gender)',
                  'Primary & secondary diagnoses',
                  'Care team with contact info',
                  'Allergies with severity levels',
                  'Recent alerts (critical warnings)',
                  'Quick call and directions buttons',
                ]}
              />
              <SectionCard
                number={2}
                icon={<Target className="size-6 text-green-600" />}
                title="Care Plan Snapshot"
                description="Key elements of the active care plan"
                features={[
                  'Active goals with progress %',
                  'Goal status (on track, at risk, achieved)',
                  'Key interventions with frequency',
                  'Special instructions highlighted',
                  'Critical safety notes flagged',
                  'Expandable/collapsible sections',
                ]}
              />
              <SectionCard
                number={3}
                icon={<Activity className="size-6 text-purple-600" />}
                title="Recent Clinical Activity"
                description="Recent events affecting patient care"
                features={[
                  'Recent visits with key findings',
                  'New orders with status',
                  'Medication updates (added/changed/discontinued)',
                  'Recent hospitalizations',
                  'Discharge summaries',
                  'Timeline view of events',
                ]}
              />
              <SectionCard
                number={4}
                icon={<CheckSquare className="size-6 text-orange-600" />}
                title="Visit Tasks"
                description="Checklist of tasks to complete during visit"
                features={[
                  'Categorized by type (observation, intervention, education, assessment)',
                  'Required vs optional tasks flagged',
                  'Checkboxes for completion tracking',
                  'Progress bar showing % complete',
                  'Task-specific notes and reminders',
                  'Pre-populated based on care plan',
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Patient Summary Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 1: Patient Summary Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              The Patient Summary provides critical information at the top of the panel with prominent visual hierarchy.
            </p>

            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Mary Johnson</h3>
                <p className="text-sm text-gray-700">72 yrs • Female • ID: PAT-001</p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-red-600">❤️</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Primary Diagnosis</p>
                    <p className="text-sm font-medium text-gray-900">Congestive Heart Failure (CHF)</p>
                    <p className="text-xs text-gray-600 mt-1">Secondary:</p>
                    <p className="text-xs text-gray-700">• Type 2 Diabetes Mellitus</p>
                    <p className="text-xs text-gray-700">• Hypertension</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-red-50 rounded-lg border-2 border-red-300">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="size-5 text-red-600" />
                  <p className="text-xs font-bold text-red-900">ALLERGIES</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-red-900">Penicillin</p>
                      <p className="text-xs text-red-800">Anaphylaxis</p>
                    </div>
                    <Badge className="bg-red-600 text-white text-xs">SEVERE</Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">📞 Call Patient</Button>
                <Button size="sm" variant="outline" className="flex-1">🗺️ Directions</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureDetail
                title="Diagnosis Display"
                items={[
                  'Primary diagnosis prominently shown',
                  'Secondary diagnoses listed',
                  'Clear visual separation',
                  'Heart icon for quick recognition',
                ]}
              />
              <FeatureDetail
                title="Allergy Alerts"
                items={[
                  'Red background for visibility',
                  'Allergen name bolded',
                  'Reaction type specified',
                  'Severity badge color-coded',
                ]}
              />
              <FeatureDetail
                title="Recent Alerts"
                items={[
                  'Critical/warning/info severity',
                  'Alert type and message',
                  'Timestamp for context',
                  'Color-coded by severity',
                ]}
              />
              <FeatureDetail
                title="Quick Actions"
                items={[
                  'One-tap phone call',
                  'GPS directions to home',
                  'Emergency contact info',
                  'Care team contact buttons',
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Care Plan Snapshot Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 2: Care Plan Snapshot Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Care Plan Snapshot shows active goals, interventions, and special instructions with expandable sections.
            </p>

            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 mb-2">Active Goals (2)</p>
                <div className="space-y-2">
                  <div className="p-2 bg-white rounded border">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-gray-900 flex-1">
                        Patient will maintain weight within 2 lbs of baseline
                      </p>
                      <Badge className="bg-orange-100 text-orange-700 text-xs">AT RISK</Badge>
                    </div>
                    <p className="text-xs text-gray-600">Target: 04/08/2026 • 60% complete</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 mb-2">Key Interventions</p>
                <div className="p-2 bg-white rounded border">
                  <p className="text-sm text-gray-900">Monitor vital signs including BP, HR, weight</p>
                  <p className="text-xs text-gray-600 mt-1">Frequency: Each visit</p>
                  <p className="text-xs text-blue-700 mt-1 italic">
                    Note: Report BP &gt;160/90 or &lt;90/60 to MD immediately
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-700 mb-2">Special Instructions</p>
                <div className="p-2 bg-amber-50 rounded border-2 border-amber-300">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Safety</p>
                      <p className="text-sm text-amber-800">
                        Patient has aggressive dog - call before entering home
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Clinical Activity Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 3: Recent Clinical Activity Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Recent Clinical Activity shows recent visits, orders, medications, and hospitalizations.
            </p>

            <div className="space-y-3">
              <ActivityExample
                icon="📅"
                title="Recent Visits (1)"
                items={[
                  {
                    label: 'RN - Skilled Nursing Visit',
                    detail: '03/06/2026 • Sarah Chen',
                    findings: [
                      'BP 148/86, HR 82, Weight 168 lbs (↑3 lbs)',
                      'Trace pedal edema bilaterally',
                      'Patient reports increased SOB with exertion',
                    ],
                  },
                ]}
              />

              <ActivityExample
                icon="📄"
                title="Recent Orders (1)"
                items={[
                  {
                    label: 'Medication Change',
                    detail: 'Increase Lasix from 20mg to 40mg PO daily',
                    badge: 'ACTIVE',
                    badgeColor: 'green',
                  },
                ]}
              />

              <ActivityExample
                icon="💊"
                title="Medication Updates (1)"
                items={[
                  {
                    label: 'Lasix (Furosemide)',
                    detail: 'Increased from 20mg to 40mg PO daily due to fluid retention',
                    badge: 'CHANGED',
                    badgeColor: 'blue',
                  },
                ]}
              />

              <ActivityExample
                icon="🏥"
                title="Recent Hospitalizations (1)"
                items={[
                  {
                    label: 'Springfield Memorial Hospital',
                    detail: 'Admitted: 01/24/2026 • Discharged: 01/31/2026',
                    summary: 'Acute CHF exacerbation. Responded well to IV diuresis.',
                  },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Visit Tasks Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Section 4: Visit Tasks Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Visit Tasks provides an interactive checklist categorized by task type with progress tracking.
            </p>

            <div className="border-2 border-green-300 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">Visit Tasks</p>
                <p className="text-sm text-gray-600">3 of 9 completed</p>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mb-4">
                <div className="h-full bg-green-600 rounded-full" style={{ width: '33%' }} />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Clinical Observations (4)</p>
                  <div className="space-y-2">
                    <TaskExample
                      completed={true}
                      required={true}
                      description="Assess vital signs (BP, HR, RR, Temp, O2 sat)"
                    />
                    <TaskExample
                      completed={true}
                      required={true}
                      description="Check daily weight"
                      note="Compare to baseline - report gain >2 lbs"
                    />
                    <TaskExample
                      completed={false}
                      required={true}
                      description="Assess for edema (ankles, legs, sacrum)"
                    />
                    <TaskExample
                      completed={false}
                      required={true}
                      description="Auscultate lung sounds"
                      note="Listen for crackles indicating fluid"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Interventions (2)</p>
                  <div className="space-y-2">
                    <TaskExample
                      completed={true}
                      required={true}
                      description="Review medication compliance"
                      note="Check pill counts if concerned"
                    />
                    <TaskExample
                      completed={false}
                      required={true}
                      description="Verify patient taking new Lasix dose (40mg)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureDetail
                title="Task Categories"
                items={[
                  'Clinical Observations',
                  'Interventions Performed',
                  'Patient Education',
                  'Clinical Assessments',
                ]}
              />
              <FeatureDetail
                title="Task Features"
                items={[
                  'Checkbox for completion',
                  'Required vs optional flagged',
                  'Task-specific notes',
                  'Progress bar tracking',
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UseCaseCard
              title="Pre-Visit Review in Car"
              scenario="Caregiver arrives 5 minutes early to patient's home"
              steps={[
                'Park car outside patient home',
                'Open Visit Preparation Panel on mobile',
                'Review Patient Summary - see Mary Johnson, 72, CHF',
                'Note ALLERGY: Penicillin - SEVERE (Anaphylaxis)',
                'See ALERT: Weight gain 5 lbs in 3 days (fluid retention warning)',
                'Review Care Plan - Goal: Maintain weight within 2 lbs (AT RISK)',
                'Check Recent Activity - Lasix increased to 40mg 2 days ago',
                'Note Special Instruction: Call before entering (aggressive dog)',
                'Review Visit Tasks - 9 tasks to complete',
                'Call patient to announce arrival',
                'Click "Start Visit" - EVV clock-in begins',
              ]}
              benefit="Fully prepared with all patient context before entering home"
            />

            <UseCaseCard
              title="Critical Safety Alert Review"
              scenario="First visit to new patient home"
              steps={[
                'Open Visit Preparation Panel',
                'Patient Summary shows 2 severe allergies',
                'Special Instructions section has CRITICAL alert:',
                '  "Patient has aggressive dog - call before entering"',
                'Call patient from car to notify arrival',
                'Patient answers - confirms dog is secured',
                'Review other safety notes:',
                '  "Patient is hard of hearing - face patient when speaking"',
                'Check Care Team contacts in case of emergency',
                'Proceed with visit armed with safety knowledge',
              ]}
              benefit="Prevented potential safety incident by reviewing alerts"
            />

            <UseCaseCard
              title="Medication Change Awareness"
              scenario="Following up on recent medication change"
              steps={[
                'Open Visit Preparation Panel',
                'Recent Clinical Activity shows:',
                '  "Medication Update: Lasix CHANGED"',
                '  "Increased from 20mg to 40mg PO daily"',
                '  "Reason: Fluid retention"',
                'Recent Visit shows:',
                '  "Weight 168 lbs (↑3 lbs from prior visit)"',
                'Visit Tasks includes:',
                '  "Verify patient taking new Lasix dose (40mg)"',
                '  "Check daily weight"',
                'During visit:',
                '  - Ask patient about new Lasix dose',
                '  - Patient shows pill bottle - confirms 40mg',
                '  - Check weight: 165 lbs (↓3 lbs - improvement!)',
                '  - Mark tasks as complete',
                'Document: "Patient compliant with increased Lasix, weight decreased"',
              ]}
              benefit="Confirmed medication change compliance and positive response"
            />
          </UseCaseCard>
        </Card>

        {/* Try It Out */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <Stethoscope className="size-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Try the Visit Preparation Panel</h3>
            <p className="text-sm text-green-800 mb-4">
              Experience the complete pre-visit briefing interface with all 4 sections
            </p>
            <Button onClick={() => setShowLive(true)} size="lg">
              Launch Panel
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">4</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Information Sections</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-red-600">100%</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Allergy Visibility</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">9</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Visit Tasks Tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">5</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Min Review Time</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface SectionCardProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

function SectionCard({ number, icon, title, description, features }: SectionCardProps) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
          {number}
        </div>
        {icon}
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-700 mb-3">{description}</p>
      <ul className="space-y-1">
        {features.map((feature, i) => (
          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
            <span className="text-blue-600">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FeatureDetailProps {
  title: string;
  items: string[];
}

function FeatureDetail({ title, items }: FeatureDetailProps) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="font-semibold text-sm mb-2 text-gray-900">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
            <CheckCircle2 className="size-3 text-green-600 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ActivityExampleProps {
  icon: string;
  title: string;
  items: Array<{
    label: string;
    detail: string;
    badge?: string;
    badgeColor?: string;
    findings?: string[];
    summary?: string;
  }>;
}

function ActivityExample({ icon, title, items }: ActivityExampleProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="p-2 bg-white rounded border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-600 mt-1">{item.detail}</p>
                {item.findings && (
                  <ul className="mt-2 space-y-0.5">
                    {item.findings.map((finding, j) => (
                      <li key={j} className="text-xs text-gray-700">• {finding}</li>
                    ))}
                  </ul>
                )}
                {item.summary && (
                  <p className="text-xs text-gray-700 mt-2 italic">{item.summary}</p>
                )}
              </div>
              {item.badge && (
                <Badge className={`text-xs ${
                  item.badgeColor === 'green' ? 'bg-green-100 text-green-700' :
                  item.badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.badge}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TaskExampleProps {
  completed: boolean;
  required: boolean;
  description: string;
  note?: string;
}

function TaskExample({ completed, required, description, note }: TaskExampleProps) {
  return (
    <div className={`p-2 rounded border ${
      completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start gap-2">
        <div className={`size-4 rounded border-2 mt-0.5 flex items-center justify-center ${
          completed ? 'bg-green-600 border-green-600' : 'border-gray-300'
        }`}>
          {completed && <span className="text-white text-xs">✓</span>}
        </div>
        <div className="flex-1">
          <p className={`text-sm ${completed ? 'line-through text-gray-600' : 'text-gray-900'}`}>
            {description}
            {required && (
              <Badge className="ml-2 bg-red-100 text-red-700 text-xs">Required</Badge>
            )}
          </p>
          {note && (
            <p className="text-xs text-gray-600 mt-1 italic">{note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface UseCaseCardProps {
  title: string;
  scenario: string;
  steps: string[];
  benefit: string;
}

function UseCaseCard({ title, scenario, steps, benefit }: UseCaseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{scenario}</p>
      <ol className="space-y-1.5 mb-3">
        {steps.map((step, i) => (
          <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
            <span className="text-blue-600 font-semibold">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="bg-green-50 border border-green-200 rounded p-2">
        <p className="text-xs text-green-800">
          <CheckCircle2 className="size-3 inline mr-1" />
          <strong>Benefit:</strong> {benefit}
        </p>
      </div>
    </div>
  );
}
