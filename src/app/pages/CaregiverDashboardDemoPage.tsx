/**
 * Caregiver Dashboard Demo Page
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import CaregiverDashboard from '../components/caregiver/CaregiverDashboard';
import {
  Info,
  CheckCircle2,
  Stethoscope,
  Calendar,
  ClipboardList,
  Bell,
  Activity,
  Clock,
  MapPin,
  Smartphone,
} from 'lucide-react';

export default function CaregiverDashboardDemoPage() {
  const [showLive, setShowLive] = useState(false);

  if (showLive) {
    return <CaregiverDashboard />;
  }

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="size-8 text-blue-600" />
            Caregiver Dashboard for Clinicians
          </h1>
          <p className="text-gray-600 mt-2">
            Daily workflow dashboard optimized for home health and hospice caregivers
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Caregiver Dashboard</p>
                <p className="mt-1 text-blue-800">
                  The Caregiver Dashboard provides a <strong>mobile-optimized interface</strong> for clinicians to manage their daily schedule, complete documentation, respond to alerts, and access patient information. Organized into <strong>4 main zones</strong> (Today's Visits, Documentation Tasks, Alerts, Quick Access) with one-tap actions for common workflows like starting visits, viewing patient charts, and completing documentation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile First Design */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Mobile-First Design</p>
                <p className="mt-1 text-green-800">
                  Built specifically for field use with <strong>large touch targets</strong>, <strong>offline-capable documentation</strong>, and <strong>simplified navigation</strong>. Caregivers can complete their entire workflow from their phone or tablet without returning to the office.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Layout Zones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">4 Dashboard Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ZoneCard
                number={1}
                icon={<Calendar className="size-6 text-blue-600" />}
                title="Today's Visits"
                description="Chronological schedule with visit details and quick actions"
                features={[
                  'Patient name and location',
                  'Visit time and discipline',
                  'Drive time and distance',
                  'Special instructions',
                  'Quick actions: Start, View Patient, Call',
                  'Status tracking: Scheduled, In Progress, Completed, Delayed',
                ]}
              />
              <ZoneCard
                number={2}
                icon={<ClipboardList className="size-6 text-purple-600" />}
                title="Documentation Tasks"
                description="Visits requiring documentation completion"
                features={[
                  'Incomplete documentation',
                  'Submitted documentation',
                  'Returned for correction',
                  'Days overdue indicator',
                  'Priority badges',
                  'One-tap to complete',
                ]}
              />
              <ZoneCard
                number={3}
                icon={<Bell className="size-6 text-red-600" />}
                title="Alerts"
                description="Critical notifications for the caregiver"
                features={[
                  'Patient condition changes',
                  'Delayed visit warnings',
                  'Missing documentation alerts',
                  'Schedule changes',
                  'Authorization issues',
                  'Severity levels: Critical, Warning, Info',
                ]}
              />
              <ZoneCard
                number={4}
                icon={<Activity className="size-6 text-green-600" />}
                title="Quick Access"
                description="Shortcuts to frequently used resources"
                features={[
                  'Recent patient charts',
                  'Recent visit notes',
                  'Saved documentation drafts',
                  'One-tap navigation',
                  'Timestamp tracking',
                  'Type indicators',
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Visit Card Anatomy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visit Card Anatomy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Each visit displays comprehensive information with clear visual hierarchy and actionable buttons.
            </p>

            <div className="border-2 border-blue-300 rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-600">👤</span>
                    <span className="font-semibold text-gray-900">Mary Johnson</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="size-4" />
                      8:00 AM - 9:00 AM
                    </span>
                    <Badge variant="outline" className="text-blue-600">RN</Badge>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">✓ Completed</Badge>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Skilled Nursing Visit</p>
                <p className="text-xs text-gray-600">Congestive Heart Failure</p>
              </div>

              <div className="flex items-start gap-2 mb-3 p-2 bg-gray-50 rounded">
                <MapPin className="size-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="text-gray-900">1234 Oak Street</p>
                  <p className="text-gray-600">Springfield, 12345</p>
                  <p className="text-xs text-gray-600 mt-1">🚗 15 min • 8.2 miles</p>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0">
                  <MapPin className="size-4" /> Route
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  📄 View Notes
                </Button>
                <Button size="sm" variant="outline">
                  👁️
                </Button>
                <Button size="sm" variant="outline">
                  📞
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                title="Patient Information"
                items={[
                  'Name with discipline icon',
                  'Visit time range',
                  'Discipline badge (RN, PT, OT, etc.)',
                  'Service type (Skilled Nursing, Wound Care)',
                  'Primary diagnosis',
                ]}
              />
              <FeatureCard
                title="Location & Navigation"
                items={[
                  'Full address with city/zip',
                  'Drive time estimate',
                  'Distance in miles',
                  'Route button for GPS navigation',
                  'Phone number for contact',
                ]}
              />
              <FeatureCard
                title="Status Tracking"
                items={[
                  'Scheduled (blue) - Not started',
                  'In Progress (green) - Currently visiting',
                  'Completed (gray) - Visit finished',
                  'Delayed (red) - Past scheduled time',
                  'Cancelled (gray) - Visit cancelled',
                ]}
              />
              <FeatureCard
                title="Quick Actions"
                items={[
                  'Start Visit - Begin EVV clock-in',
                  'View Patient - Open patient chart',
                  'View/Document Notes - Add visit documentation',
                  'Call Patient - One-tap phone call',
                  'Get Directions - Open GPS navigation',
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documentation Task States */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documentation Task States</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DocumentationStateExample
              status="incomplete"
              color="amber"
              title="Documentation Incomplete"
              description="Visit documentation has not been submitted"
              action="Complete Documentation"
              urgency="Becomes overdue after 24 hours"
            />
            <DocumentationStateExample
              status="submitted"
              color="blue"
              title="Documentation Submitted"
              description="Submitted and awaiting QA review"
              action="View Submitted Documentation"
              urgency="No action required - in review"
            />
            <DocumentationStateExample
              status="returned"
              color="red"
              title="Documentation Returned"
              description="QA returned for correction with specific feedback"
              action="Correct & Resubmit"
              urgency="High priority - requires immediate correction"
            />
            <DocumentationStateExample
              status="approved"
              color="green"
              title="Documentation Approved"
              description="QA approved - documentation complete"
              action="View Approved Documentation"
              urgency="Complete - no action needed"
            />
          </CardContent>
        </Card>

        {/* Alert Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alert Types & Severity Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertExample
              severity="critical"
              icon="🔴"
              title="Patient Condition Change"
              message="Michael Brown reported increased shortness of breath. Consider assessment priority."
              action="View Patient Chart"
            />
            <AlertExample
              severity="warning"
              icon="🟠"
              title="Documentation Overdue"
              message="Visit note for John Anderson is 1 day overdue. Please complete ASAP."
              action="Complete Documentation"
            />
            <AlertExample
              severity="info"
              icon="🔵"
              title="Schedule Update"
              message="Tomorrow's 9:00 AM visit with James Wilson has been rescheduled to 10:30 AM."
              action="View Schedule"
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">One-Tap Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickActionCard
                icon="▶️"
                title="Start Visit"
                description="Begin EVV clock-in and open visit workflow"
                workflow={[
                  'GPS verification',
                  'Clock-in timestamp',
                  'Open visit checklist',
                  'Access patient chart',
                ]}
              />
              <QuickActionCard
                icon="👁️"
                title="View Patient"
                description="Open complete patient chart with all history"
                workflow={[
                  'Demographics',
                  'Active orders',
                  'Medications',
                  'Recent visit notes',
                ]}
              />
              <QuickActionCard
                icon="📝"
                title="Document Visit"
                description="Complete or update visit documentation"
                workflow={[
                  'Visit type selection',
                  'Assessment entry',
                  'Interventions',
                  'Submit for QA',
                ]}
              />
              <QuickActionCard
                icon="📞"
                title="Call Patient"
                description="One-tap phone call to patient"
                workflow={[
                  'Dial patient number',
                  'Log call in system',
                  'Note conversation',
                  'Schedule follow-up',
                ]}
              />
              <QuickActionCard
                icon="🗺️"
                title="Get Directions"
                description="Open GPS navigation to patient address"
                workflow={[
                  'Launch maps app',
                  'Optimized route',
                  'Traffic updates',
                  'ETA calculation',
                ]}
              />
              <QuickActionCard
                icon="✏️"
                title="Resume Draft"
                description="Continue incomplete documentation"
                workflow={[
                  'Load saved draft',
                  'Auto-save enabled',
                  'Offline capable',
                  'Submit when ready',
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
              title="Morning Workflow - Starting the Day"
              scenario="Caregiver logs in at 7:30 AM to review daily schedule"
              steps={[
                'Open Caregiver Dashboard on mobile device',
                'View Today\'s Visits tab - see 5 visits scheduled',
                'Check progress bar: 0/5 visits (0% complete)',
                'Review first visit: Mary Johnson at 8:00 AM',
                'Click "Route" button - GPS opens with directions',
                'Drive to patient home (15 min, 8.2 miles)',
                'Arrive at 7:55 AM - click "Start Visit"',
                'EVV clock-in with GPS verification',
                'Visit checklist opens automatically',
              ]}
              benefit="Seamless morning start with all visit info at fingertips"
            />

            <UseCaseCard
              title="Mid-Day Documentation - Completing Visit Notes"
              scenario="Caregiver has 15-minute break between visits"
              steps={[
                'Check Documentation Tasks section',
                'See 1 incomplete task: John Anderson (1 day overdue)',
                'Priority badge shows "URGENT" in red',
                'Click "Complete Documentation"',
                'Visit note form opens with patient context pre-filled',
                'Enter vital signs: BP 142/88, HR 76, Temp 98.6°F',
                'Document wound measurements and photo',
                'Add narrative: "Patient reports improved mobility..."',
                'Click "Submit for QA Review"',
                'Task moves to "Submitted" status',
                'Dashboard shows 0 incomplete tasks ✓',
              ]}
              benefit="Quick documentation during breaks prevents end-of-day backlog"
            />

            <UseCaseCard
              title="Critical Alert Response - Patient Condition Change"
              scenario="Patient reports worsening symptoms during phone call"
              steps={[
                'Alert appears in red: "Patient Condition Change - CRITICAL"',
                'Message: "Michael Brown reported increased shortness of breath"',
                'Click "View Patient Chart"',
                'Review recent vital signs trend - O2 sat dropping',
                'Check medication list - patient missed 2 doses',
                'Call patient: Click phone button from visit card',
                'Discuss symptoms and medication compliance',
                'Document conversation in visit notes',
                'Escalate to nursing supervisor via alert',
                'Supervisor schedules urgent RN visit for today',
                'Dashboard updates with new urgent visit added',
              ]}
              benefit="Rapid response to critical situations with all info in one place"
            />
          </CardContent>
        </Card>

        {/* Mobile Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mobile-Optimized Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MobileFeatureCard
                icon="📱"
                title="Large Touch Targets"
                description="All buttons sized for easy tapping while driving or wearing gloves"
              />
              <MobileFeatureCard
                icon="💾"
                title="Offline Capability"
                description="Document visits without internet - syncs when connection restored"
              />
              <MobileFeatureCard
                icon="🗺️"
                title="GPS Integration"
                description="One-tap navigation to patient homes with optimized routing"
              />
              <MobileFeatureCard
                icon="📸"
                title="Photo Documentation"
                description="Capture wound photos, home environment, medication bottles"
              />
              <MobileFeatureCard
                icon="🔒"
                title="Biometric Security"
                description="Face ID or fingerprint login for quick secure access"
              />
              <MobileFeatureCard
                icon="🔋"
                title="Battery Optimized"
                description="Efficient design extends battery life during long field days"
              />
            </div>
          </CardContent>
        </Card>

        {/* Try It Out */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <Stethoscope className="size-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Try the Caregiver Dashboard</h3>
            <p className="text-sm text-green-800 mb-4">
              Experience the complete mobile-optimized workflow for home health clinicians
            </p>
            <Button onClick={() => setShowLive(true)} size="lg">
              Launch Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">4</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Dashboard Zones</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">6</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Visit Statuses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-red-600">3</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Alert Severity Levels</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">1</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Tap to Start Visit</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface ZoneCardProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

function ZoneCard({ number, icon, title, description, features }: ZoneCardProps) {
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

interface FeatureCardProps {
  title: string;
  items: string[];
}

function FeatureCard({ title, items }: FeatureCardProps) {
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

interface DocumentationStateExampleProps {
  status: string;
  color: string;
  title: string;
  description: string;
  action: string;
  urgency: string;
}

function DocumentationStateExample({ status, color, title, description, action, urgency }: DocumentationStateExampleProps) {
  const colors: Record<string, string> = {
    amber: 'border-amber-300 bg-amber-50',
    blue: 'border-blue-300 bg-blue-50',
    red: 'border-red-300 bg-red-50',
    green: 'border-green-300 bg-green-50',
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colors[color]}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
          <p className="text-xs text-gray-700 mt-1">{description}</p>
        </div>
        <Badge className={`bg-${color}-100 text-${color}-700 text-xs`}>
          {status.toUpperCase()}
        </Badge>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Button size="sm" variant="outline" className="flex-1">
          {action}
        </Button>
      </div>
      <p className="text-xs text-gray-600 mt-2 italic">{urgency}</p>
    </div>
  );
}

interface AlertExampleProps {
  severity: string;
  icon: string;
  title: string;
  message: string;
  action: string;
}

function AlertExample({ severity, icon, title, message, action }: AlertExampleProps) {
  const colors: Record<string, string> = {
    critical: 'border-red-300 bg-red-50',
    warning: 'border-orange-300 bg-orange-50',
    info: 'border-blue-300 bg-blue-50',
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colors[severity]}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
          <p className="text-xs text-gray-700 mt-1">{message}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="flex-1">
          {action}
        </Button>
        <Button size="sm" variant="ghost">
          Dismiss
        </Button>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: string;
  title: string;
  description: string;
  workflow: string[];
}

function QuickActionCard({ icon, title, description, workflow }: QuickActionCardProps) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg bg-white">
      <div className="text-center mb-3">
        <span className="text-3xl">{icon}</span>
        <h4 className="font-semibold text-sm text-gray-900 mt-2">{title}</h4>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
      <ul className="space-y-1">
        {workflow.map((step, i) => (
          <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
            <span className="text-blue-600">→</span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
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

interface MobileFeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function MobileFeatureCard({ icon, title, description }: MobileFeatureCardProps) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg bg-white text-center">
      <span className="text-3xl">{icon}</span>
      <h4 className="font-semibold text-sm text-gray-900 mt-2">{title}</h4>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );
}