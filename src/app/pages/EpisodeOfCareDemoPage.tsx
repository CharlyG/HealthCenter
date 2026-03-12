/**
 * Episode of Care Demo Page
 * 
 * Demonstrates the Episode of Care Dashboard as the central hub
 * for managing patient admissions.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  EpisodeOfCareDashboard,
  type EpisodeData,
} from '../components/episode/EpisodeOfCareDashboard';
import {
  Info,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Users,
  FileText,
  Shield,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react';

export default function EpisodeOfCareDemoPage() {
  // Mock episode data
  const mockEpisodeData: EpisodeData = {
    episode: {
      admissionId: 'ADM-2024-001',
      patientId: 'PT-001234',
      patientName: 'Johnson, Mary Elizabeth',
      startDate: '2024-02-01',
      status: 'active',
      type: 'home_health',
      episodeNumber: 1,
      dayInEpisode: 42,
      primaryPayer: 'Medicare',
      primaryDiagnosis: 'CHF Exacerbation, Diabetes Type 2',
      certificationPeriod: {
        start: '2024-02-01',
        end: '2024-04-01',
        type: 'initial',
      },
    },
    authorization: {
      status: 'approved',
      authNumber: 'AUTH-2024-12345',
      validThrough: '2024-04-01',
      visitsAuthorized: 20,
      visitsUsed: 12,
      daysRemaining: 18,
      alerts: [
        {
          type: 'warning',
          message: '8 visits remaining - review frequency',
        },
      ],
    },
    documentation: {
      total: 25,
      completed: 20,
      pending: 3,
      overdue: 2,
      categories: [
        { name: 'Visit Notes', completed: 12, total: 15 },
        { name: 'Assessments', completed: 2, total: 3 },
        { name: 'Care Plans', completed: 3, total: 3 },
        { name: 'Orders', completed: 3, total: 4 },
      ],
    },
    upcomingVisits: [
      {
        visitId: 'V-2024-101',
        scheduledDate: '2024-03-10',
        scheduledTime: '9:00 AM',
        discipline: 'RN',
        clinicianName: 'Sarah Thompson, RN',
        visitType: 'Skilled Nursing Visit',
        status: 'confirmed',
        daysUntil: 0,
      },
      {
        visitId: 'V-2024-102',
        scheduledDate: '2024-03-12',
        scheduledTime: '2:00 PM',
        discipline: 'PT',
        clinicianName: 'Michael Chen, PT',
        visitType: 'Physical Therapy',
        status: 'scheduled',
        daysUntil: 2,
      },
      {
        visitId: 'V-2024-103',
        scheduledDate: '2024-03-14',
        scheduledTime: '10:00 AM',
        discipline: 'RN',
        clinicianName: 'Sarah Thompson, RN',
        visitType: 'Skilled Nursing Visit',
        status: 'scheduled',
        daysUntil: 4,
      },
    ],
    careTeam: [
      {
        memberId: 'CM-001',
        name: 'Dr. Robert Williams',
        role: 'Physician',
        phone: '555-0123',
      },
      {
        memberId: 'CM-002',
        name: 'Jessica Martinez',
        role: 'Case Manager',
        isPrimary: true,
        phone: '555-0124',
        lastContact: '2024-03-08',
      },
      {
        memberId: 'CM-003',
        name: 'Sarah Thompson',
        role: 'RN',
        isPrimary: true,
        phone: '555-0125',
        visitCount: 12,
      },
      {
        memberId: 'CM-004',
        name: 'Michael Chen',
        role: 'PT',
        phone: '555-0126',
        visitCount: 8,
      },
      {
        memberId: 'CM-005',
        name: 'Emily Davis',
        role: 'OT',
        phone: '555-0127',
        visitCount: 4,
      },
    ],
    alerts: [
      {
        id: 'alert-1',
        type: 'critical',
        category: 'documentation',
        title: 'Overdue OASIS Assessment',
        description: 'Recertification OASIS due by end of day',
        dueDate: '2024-03-10',
        actionLabel: 'Complete Assessment',
        actionPath: '/assessments',
      },
      {
        id: 'alert-2',
        type: 'warning',
        category: 'authorization',
        title: 'Authorization Nearing Limit',
        description: '8 of 20 authorized visits remaining',
        actionLabel: 'Request Extension',
        actionPath: '/authorization-tracker',
      },
      {
        id: 'alert-3',
        type: 'warning',
        category: 'clinical',
        title: 'Physician Orders Expiring',
        description: '3 orders expire in 5 days',
        dueDate: '2024-03-15',
        actionLabel: 'Renew Orders',
        actionPath: '/orders',
      },
    ],
  };

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="size-8 text-blue-600" />
            Episode of Care Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Central hub for managing patient admission episodes
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Episode of Care Dashboard</p>
                <p className="mt-1 text-blue-800">
                  The Episode Dashboard serves as <strong>mission control</strong> for a patient
                  admission. It displays the operational status of the episode with integrated views of
                  authorization, documentation, visits, care team, and alerts—all in one place for
                  efficient episode management.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Components Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dashboard Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ComponentCard
                icon={Activity}
                title="Episode Status"
                description="Real-time operational status"
                color="blue"
              />
              <ComponentCard
                icon={Shield}
                title="Authorization"
                description="Auth status and usage"
                color="green"
              />
              <ComponentCard
                icon={FileText}
                title="Documentation"
                description="Completion tracking"
                color="purple"
              />
              <ComponentCard
                icon={Calendar}
                title="Upcoming Visits"
                description="Schedule preview"
                color="orange"
              />
              <ComponentCard
                icon={Users}
                title="Care Team"
                description="Team members"
                color="indigo"
              />
              <ComponentCard
                icon={AlertTriangle}
                title="Alerts"
                description="Critical issues"
                color="red"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">6</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Dashboard Components</p>
              <p className="text-xs text-gray-500 mt-1">All in one view</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {mockEpisodeData.episode.dayInEpisode}/60
              </p>
              <p className="text-sm text-gray-700 font-medium mt-1">Episode Day</p>
              <p className="text-xs text-gray-500 mt-1">Progress tracking</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">{mockEpisodeData.alerts.length}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Active Alerts</p>
              <p className="text-xs text-gray-500 mt-1">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-indigo-600">{mockEpisodeData.careTeam.length}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Care Team</p>
              <p className="text-xs text-gray-500 mt-1">Members assigned</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Live Dashboard vs Features */}
        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="use-cases">Use Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            {/* Live Dashboard Preview */}
            <div className="border-4 border-gray-300 rounded-lg overflow-hidden">
              <EpisodeOfCareDashboard
                data={mockEpisodeData}
                onNavigate={(path) => console.log('Navigate to:', path)}
              />
            </div>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <FeaturesOverview />
          </TabsContent>

          <TabsContent value="use-cases" className="mt-6">
            <UseCasesOverview />
          </TabsContent>
        </Tabs>

        {/* Implementation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Ready to Use</p>
                <p className="mt-1 text-green-800">
                  Import <code className="bg-green-200 px-1 py-0.5 rounded">EpisodeOfCareDashboard</code>{' '}
                  from <code className="bg-green-200 px-1 py-0.5 rounded">@/components/episode</code>.
                  The dashboard is fully typed, responsive, and production-ready.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

interface ComponentCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'red';
}

function ComponentCard({ icon: Icon, title, description, color }: ComponentCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="text-center p-4 border border-gray-200 rounded-lg bg-white">
      <div className={`size-12 rounded-lg mx-auto mb-2 flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="size-6" />
      </div>
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );
}

function FeaturesOverview() {
  const features = [
    {
      title: 'Real-Time Status',
      description: 'Episode progress, day count, certification dates all visible at a glance',
      icon: Activity,
    },
    {
      title: 'Integrated Authorization',
      description: 'Auth status, visit usage, expiration dates with visual progress bars',
      icon: Shield,
    },
    {
      title: 'Documentation Tracking',
      description: 'Completion rates, pending items, overdue documentation highlighted',
      icon: FileText,
    },
    {
      title: 'Visit Preview',
      description: 'Upcoming visits with dates, disciplines, and clinician assignments',
      icon: Calendar,
    },
    {
      title: 'Care Team Access',
      description: 'Quick access to all team members with contact info and visit counts',
      icon: Users,
    },
    {
      title: 'Proactive Alerts',
      description: 'Critical issues surfaced with clear action buttons for resolution',
      icon: AlertTriangle,
    },
    {
      title: 'Quick Actions',
      description: 'One-click access to common tasks like scheduling and documentation',
      icon: Zap,
    },
    {
      title: 'Operational Insights',
      description: 'Key metrics and KPIs for episode performance monitoring',
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <Card key={feature.title}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="size-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function UseCasesOverview() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Case Manager Daily Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            Case manager opens episode dashboard at start of day:
          </p>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
              <span>
                <strong>Reviews alerts:</strong> Sees overdue OASIS assessment (critical alert)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
              <span>
                <strong>Checks upcoming visits:</strong> Confirms RN visit scheduled for today
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
              <span>
                <strong>Reviews documentation:</strong> Notes 2 overdue visit notes, assigns follow-up
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">4.</span>
              <span>
                <strong>Verifies authorization:</strong> Sees 8 visits remaining, plans for extension
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">5.</span>
              <span>
                <strong>Contacts care team:</strong> Calls primary RN to discuss patient progress
              </span>
            </li>
          </ol>
          <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
            <p className="text-sm text-green-800">
              <CheckCircle2 className="size-4 inline mr-1" />
              <strong>Result:</strong> Complete episode status review in under 2 minutes
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Clinician Visit Preparation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            RN preparing for patient visit:
          </p>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
              <span>
                <strong>Opens episode dashboard:</strong> Sees episode on day 42/60
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
              <span>
                <strong>Reviews recent documentation:</strong> Reads last PT note from 2 days ago
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
              <span>
                <strong>Checks care team:</strong> Notes OT also working with patient
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">4.</span>
              <span>
                <strong>Views alerts:</strong> Sees physician orders expiring in 5 days—plans to renew
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">5.</span>
              <span>
                <strong>Uses quick action:</strong> Clicks "Add Note" to document visit immediately after
              </span>
            </li>
          </ol>
          <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
            <p className="text-sm text-green-800">
              <CheckCircle2 className="size-4 inline mr-1" />
              <strong>Result:</strong> Well-prepared visit with awareness of all episode context
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing Specialist Episode Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-700">
            Billing specialist reviewing episode nearing completion:
          </p>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">1.</span>
              <span>
                <strong>Opens dashboard:</strong> Sees episode on day 55/60—approaching billing
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">2.</span>
              <span>
                <strong>Checks authorization:</strong> Confirms 12 of 20 visits used, auth valid through episode end
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">3.</span>
              <span>
                <strong>Reviews documentation:</strong> 80% complete—notes 3 pending items to address
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">4.</span>
              <span>
                <strong>Verifies assessments:</strong> Clicks "View Details" to confirm OASIS completion
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-blue-600 flex-shrink-0">5.</span>
              <span>
                <strong>Plans billing:</strong> Sets reminder for final review on day 59
              </span>
            </li>
          </ol>
          <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
            <p className="text-sm text-green-800">
              <CheckCircle2 className="size-4 inline mr-1" />
              <strong>Result:</strong> Clear billing readiness assessment with specific action items
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
