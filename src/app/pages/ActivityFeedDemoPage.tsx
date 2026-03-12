/**
 * Activity Feed Demo Page
 * 
 * Demonstrates chronological activity feed for healthcare operations.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ActivityFeed,
  CompactActivityFeed,
  type ActivityItem,
} from '../components/activity/ActivityFeed';
import {
  Info,
  CheckCircle2,
  Zap,
  Activity,
  Users,
  TrendingUp,
  Bell,
  Eye,
} from 'lucide-react';

export default function ActivityFeedDemoPage() {
  // Mock activity data
  const mockActivities: ActivityItem[] = [
    // Today's activities
    {
      id: 'a1',
      type: 'visit_completed',
      category: 'visit',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
      user: { name: 'Sarah Thompson', role: 'RN' },
      description: 'Skilled nursing visit completed',
      details: 'Wound care and medication administration',
      patientId: 'PT-001234',
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      actionPath: '/poc/visit/V-12345',
      actionLabel: 'View Visit',
      priority: 'medium',
    },
    {
      id: 'a2',
      type: 'documentation_signed',
      category: 'documentation',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
      user: { name: 'Dr. Michael Chen', role: 'Physician' },
      description: 'Physician orders signed',
      details: 'Updated medication orders for CHF management',
      patientId: 'PT-001234',
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      actionPath: '/clinical/orders',
      actionLabel: 'View Orders',
    },
    {
      id: 'a3',
      type: 'authorization_approved',
      category: 'authorization',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
      user: { name: 'Lisa Anderson', role: 'Authorization Specialist' },
      description: 'Medicare authorization approved',
      details: '20 visits authorized for 60-day episode',
      patientId: 'PT-002345',
      patientName: 'Williams, Robert',
      admissionId: 'ADM-2024-015',
      actionPath: '/authorization-tracker',
      actionLabel: 'View Authorization',
      priority: 'high',
    },
    {
      id: 'a4',
      type: 'claim_submitted',
      category: 'billing',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      user: { name: 'Jennifer Martinez', role: 'Billing Specialist' },
      description: 'Episode claim submitted to Medicare',
      details: 'Claim #CLM-2024-0453 - $3,845.00',
      patientId: 'PT-003456',
      patientName: 'Davis, Susan',
      admissionId: 'ADM-2024-008',
      actionPath: '/billing',
      actionLabel: 'View Claim',
    },
    {
      id: 'a5',
      type: 'message_sent',
      category: 'message',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
      user: { name: 'Emily Rodriguez', role: 'Case Manager' },
      description: 'Message sent to care team',
      details: 'Patient requesting schedule change for PT visits',
      patientId: 'PT-001234',
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      actionPath: '/careconnect',
      actionLabel: 'View Message',
    },
    {
      id: 'a6',
      type: 'alert_created',
      category: 'system',
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
      user: { name: 'System', role: 'Automated' },
      description: 'High priority alert: OASIS assessment overdue',
      details: 'Recertification OASIS due within 24 hours',
      patientId: 'PT-004567',
      patientName: 'Brown, James',
      admissionId: 'ADM-2024-012',
      actionPath: '/clinical/assessments',
      actionLabel: 'View Assessment',
      priority: 'high',
    },

    // Yesterday's activities
    {
      id: 'a7',
      type: 'visit_scheduled',
      category: 'visit',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 30).toISOString(),
      user: { name: 'Amanda Foster', role: 'Scheduler' },
      description: 'PT visit scheduled',
      details: 'Physical therapy evaluation scheduled for 03/12',
      patientId: 'PT-001234',
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      actionPath: '/scheduling',
      actionLabel: 'View Schedule',
    },
    {
      id: 'a8',
      type: 'documentation_updated',
      category: 'documentation',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 120).toISOString(),
      user: { name: 'Sarah Thompson', role: 'RN' },
      description: 'Visit notes updated',
      details: 'Added follow-up care instructions',
      patientId: 'PT-001234',
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      actionPath: '/clinical/visit-notes',
      actionLabel: 'View Notes',
    },
    {
      id: 'a9',
      type: 'claim_paid',
      category: 'billing',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 180).toISOString(),
      user: { name: 'System', role: 'Automated' },
      description: 'Claim payment received',
      details: 'Medicare payment: $3,542.00',
      patientId: 'PT-005678',
      patientName: 'Miller, Patricia',
      admissionId: 'ADM-2024-005',
      actionPath: '/billing',
      actionLabel: 'View Payment',
    },
    {
      id: 'a10',
      type: 'staff_assigned',
      category: 'system',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 300).toISOString(),
      user: { name: 'David Wilson', role: 'Clinical Manager' },
      description: 'Primary nurse assigned',
      details: 'Sarah Thompson assigned as primary RN',
      patientId: 'PT-006789',
      patientName: 'Anderson, Thomas',
      admissionId: 'ADM-2024-018',
      actionPath: '/careconnect',
      actionLabel: 'View Care Team',
    },

    // This week
    {
      id: 'a11',
      type: 'order_renewed',
      category: 'order',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      user: { name: 'Dr. Michael Chen', role: 'Physician' },
      description: 'Physician orders renewed',
      details: 'Orders renewed for next 60-day episode',
      patientId: 'PT-001234',
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      actionPath: '/clinical/orders',
      actionLabel: 'View Orders',
    },
    {
      id: 'a12',
      type: 'authorization_expiring',
      category: 'authorization',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
      user: { name: 'System', role: 'Automated' },
      description: 'Authorization expiring soon',
      details: 'Blue Cross authorization expires in 7 days',
      patientId: 'PT-007890',
      patientName: 'Taylor, Jessica',
      admissionId: 'ADM-2024-010',
      actionPath: '/authorization-tracker',
      actionLabel: 'Renew Authorization',
      priority: 'high',
    },
    {
      id: 'a13',
      type: 'visit_reassigned',
      category: 'visit',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
      user: { name: 'Amanda Foster', role: 'Scheduler' },
      description: 'Visit reassigned to different clinician',
      details: 'Reassigned from John Davis to Emily White due to call-out',
      patientId: 'PT-002345',
      patientName: 'Williams, Robert',
      admissionId: 'ADM-2024-015',
      actionPath: '/scheduling',
      actionLabel: 'View Schedule',
    },
    {
      id: 'a14',
      type: 'admission_created',
      category: 'system',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
      user: { name: 'Emily Rodriguez', role: 'Case Manager' },
      description: 'New admission created',
      details: 'Home health admission for post-surgical care',
      patientId: 'PT-008901',
      patientName: 'Garcia, Carlos',
      admissionId: 'ADM-2024-022',
      actionPath: '/admissions/ADM-2024-022',
      actionLabel: 'View Admission',
      priority: 'medium',
    },
    {
      id: 'a15',
      type: 'claim_rejected',
      category: 'billing',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(), // 6 days ago
      user: { name: 'System', role: 'Automated' },
      description: 'Claim rejected by payer',
      details: 'Medicaid claim rejected - missing documentation',
      patientId: 'PT-009012',
      patientName: 'Thompson, Linda',
      admissionId: 'ADM-2024-009',
      actionPath: '/billing',
      actionLabel: 'Review Rejection',
      priority: 'high',
    },
  ];

  // Patient-specific activities
  const patientActivities = mockActivities.filter(
    (a) => a.patientId === 'PT-001234'
  );

  // Admission-specific activities
  const admissionActivities = mockActivities.filter(
    (a) => a.admissionId === 'ADM-2024-001'
  );

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="size-8 text-blue-600" />
            Activity Feed System
          </h1>
          <p className="text-gray-600 mt-2">
            Chronological activity feed for healthcare operations
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Activity Feed</p>
                <p className="mt-1 text-blue-800">
                  The activity feed displays <strong>chronological events</strong> related to
                  patients and admissions. Each activity shows an event icon, timestamp, user,
                  description, and quick action link. Supports filtering by category, date,
                  search, and grouping by day.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Types (26+)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <CategoryCard
                title="Visit Activities"
                items={['Completed', 'Cancelled', 'Reassigned', 'Scheduled']}
                color="green"
              />
              <CategoryCard
                title="Documentation"
                items={['Created', 'Updated', 'Signed', 'Reviewed']}
                color="blue"
              />
              <CategoryCard
                title="Orders"
                items={['Signed', 'Renewed', 'Expired']}
                color="purple"
              />
              <CategoryCard
                title="Authorization"
                items={['Approved', 'Denied', 'Renewed', 'Expiring']}
                color="orange"
              />
              <CategoryCard
                title="Billing"
                items={['Submitted', 'Paid', 'Rejected', 'Adjusted']}
                color="indigo"
              />
              <CategoryCard
                title="Messages & System"
                items={['Messages', 'Notes', 'Alerts', 'Assignments']}
                color="amber"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feed Variants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feed Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="global">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="global">Global Feed</TabsTrigger>
                <TabsTrigger value="patient">Patient Feed</TabsTrigger>
                <TabsTrigger value="admission">Admission Feed</TabsTrigger>
              </TabsList>

              <TabsContent value="global" className="mt-6">
                <div className="space-y-3 mb-4">
                  <h3 className="font-semibold text-gray-900">Global Activity Feed</h3>
                  <p className="text-sm text-gray-600">
                    Shows all activities across the organization. Ideal for dashboards and
                    operational oversight.
                  </p>
                </div>
                <ActivityFeed
                  items={mockActivities}
                  title="All Activities"
                  showPatient={true}
                  showFilters={true}
                  maxHeight="500px"
                />
              </TabsContent>

              <TabsContent value="patient" className="mt-6">
                <div className="space-y-3 mb-4">
                  <h3 className="font-semibold text-gray-900">Patient-Specific Feed</h3>
                  <p className="text-sm text-gray-600">
                    Shows only activities for a specific patient. Used in patient charts.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Patient: Johnson, Mary</Badge>
                    <Badge variant="outline">MRN: 001234</Badge>
                  </div>
                </div>
                <ActivityFeed
                  items={patientActivities}
                  title="Patient Activity"
                  showPatient={false}
                  showFilters={false}
                  maxHeight="500px"
                />
              </TabsContent>

              <TabsContent value="admission" className="mt-6">
                <div className="space-y-3 mb-4">
                  <h3 className="font-semibold text-gray-900">Admission-Specific Feed</h3>
                  <p className="text-sm text-gray-600">
                    Shows only activities for a specific admission. Used in admission workflows.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Admission: ADM-2024-001</Badge>
                    <Badge variant="outline">Day 42/60</Badge>
                  </div>
                </div>
                <ActivityFeed
                  items={admissionActivities}
                  title="Admission Activity"
                  showPatient={false}
                  showFilters={false}
                  maxHeight="500px"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Compact Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompactActivityFeed
            items={mockActivities}
            title="Recent Activity"
            maxItems={5}
            onViewAll={() => console.log('View all')}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Use Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <UseCaseItem
                title="Dashboard Overview"
                description="Show recent activity across all patients and admissions"
              />
              <UseCaseItem
                title="Patient Chart"
                description="Display patient-specific activity timeline"
              />
              <UseCaseItem
                title="Admission Workflow"
                description="Track all events for a single admission"
              />
              <UseCaseItem
                title="Care Coordination"
                description="Monitor team communication and status updates"
              />
              <UseCaseItem
                title="Audit Trail"
                description="Compliance documentation of all system activities"
              />
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={Activity}
                title="Real-Time Updates"
                description="Activity feed updates automatically as events occur"
              />
              <FeatureCard
                icon={Users}
                title="Context-Aware"
                description="Global, patient-specific, or admission-specific views"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Chronological Grouping"
                description="Activities grouped by day (Today, Yesterday, This Week)"
              />
              <FeatureCard
                icon={Bell}
                title="Priority Indicators"
                description="High-priority activities clearly marked"
              />
              <FeatureCard
                icon={Eye}
                title="Quick Actions"
                description="One-click navigation to related records"
              />
              <FeatureCard
                icon={Zap}
                title="Advanced Filtering"
                description="Search, filter by category, date range, or user"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">26+</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Activity Types</p>
              <p className="text-xs text-gray-500 mt-1">Across 6 categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">3</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Feed Contexts</p>
              <p className="text-xs text-gray-500 mt-1">Global, Patient, Admission</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">6</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Data Points</p>
              <p className="text-xs text-gray-500 mt-1">Per activity item</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">2</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Feed Variants</p>
              <p className="text-xs text-gray-500 mt-1">Full & Compact</p>
            </CardContent>
          </Card>
        </div>

        {/* Implementation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Ready to Use</p>
                <p className="mt-1 text-green-800">
                  Import <code className="bg-green-200 px-1 py-0.5 rounded">ActivityFeed</code> or{' '}
                  <code className="bg-green-200 px-1 py-0.5 rounded">CompactActivityFeed</code>{' '}
                  from <code className="bg-green-200 px-1 py-0.5 rounded">@/components/activity</code>.
                  Supports 26+ activity types, filtering, searching, and grouping. Fully typed with
                  TypeScript.
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

interface CategoryCardProps {
  title: string;
  items: string[];
  color: 'green' | 'blue' | 'purple' | 'orange' | 'indigo' | 'amber';
}

function CategoryCard({ title, items, color }: CategoryCardProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">{title}</h3>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <div
            key={index}
            className={`text-xs px-2 py-1 rounded ${colorClasses[color]}`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="size-5 text-blue-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

interface UseCaseItemProps {
  title: string;
  description: string;
}

function UseCaseItem({ title, description }: UseCaseItemProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="size-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}
