/**
 * Design System Showcase
 * Demonstrates all healthcare design system components
 */
import React, { useState } from 'react';
import { PageLayout, PageHeader } from '../components/design-system/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import {
  Palette,
  Type,
  Square,
  Layout,
  Users,
  Calendar,
  FileText,
  Building2,
  Plus,
} from 'lucide-react';
import {
  StatusBadge,
  QueueCard,
  MetricCard,
  EmptyState,
  AdmissionSummaryPanel,
  PayerSummaryPanel,
  AuthorizationWarning,
  EVVStatusCard,
  HOPEOASISTracker,
  MDSignatureQueueItem,
  OpenShiftQueueItem,
  DelayedVisitAlert,
  QAStatusBadge,
  PatientContextHeader,
  SplitViewLayout,
  WorkspaceLayout,
  WorkspaceHeader,
  WorkspaceSection,
} from '../components/design-system';

export default function DesignSystemShowcase() {
  const [inspectorOpen, setInspectorOpen] = useState(true);

  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        icon={<Palette className="size-8" />}
        title="Healthcare Design System"
        subtitle="Production-grade components for enterprise healthcare operations"
      />

      <Tabs defaultValue="foundations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="foundations">Foundations</TabsTrigger>
          <TabsTrigger value="components">Core Components</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare Patterns</TabsTrigger>
          <TabsTrigger value="layouts">Layouts</TabsTrigger>
        </TabsList>

        {/* Foundations */}
        <TabsContent value="foundations" className="space-y-6">
          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-5" />
                Color System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-600">STATUS COLORS</h4>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <div className="h-16 bg-blue-600 rounded-lg mb-2"></div>
                      <div className="text-xs font-mono">Primary</div>
                      <div className="text-xs text-gray-500">#2563eb</div>
                    </div>
                    <div>
                      <div className="h-16 bg-green-600 rounded-lg mb-2"></div>
                      <div className="text-xs font-mono">Success</div>
                      <div className="text-xs text-gray-500">#16a34a</div>
                    </div>
                    <div>
                      <div className="h-16 bg-yellow-500 rounded-lg mb-2"></div>
                      <div className="text-xs font-mono">Warning</div>
                      <div className="text-xs text-gray-500">#f59e0b</div>
                    </div>
                    <div>
                      <div className="h-16 bg-red-600 rounded-lg mb-2"></div>
                      <div className="text-xs font-mono">Danger</div>
                      <div className="text-xs text-gray-500">#dc2626</div>
                    </div>
                    <div>
                      <div className="h-16 bg-cyan-600 rounded-lg mb-2"></div>
                      <div className="text-xs font-mono">Info</div>
                      <div className="text-xs text-gray-500">#0891b2</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-600">NEUTRALS</h4>
                  <div className="grid grid-cols-10 gap-2">
                    {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                      <div key={shade}>
                        <div className={`h-12 bg-neutral-${shade} rounded-md mb-1 border border-gray-200`}></div>
                        <div className="text-xs text-center">{shade}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="size-5" />
                Typography Scale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-semibold mb-1">Page Title</div>
                <div className="text-xs text-gray-500 font-mono">30px / font-semibold</div>
              </div>
              <div>
                <div className="text-2xl font-semibold mb-1">Section Header</div>
                <div className="text-xs text-gray-500 font-mono">24px / font-semibold</div>
              </div>
              <div>
                <div className="text-xl font-semibold mb-1">Card Header</div>
                <div className="text-xs text-gray-500 font-mono">20px / font-semibold</div>
              </div>
              <div>
                <div className="text-base mb-1">Body Text</div>
                <div className="text-xs text-gray-500 font-mono">16px / font-normal</div>
              </div>
              <div>
                <div className="text-sm mb-1">Secondary Text</div>
                <div className="text-xs text-gray-500 font-mono">14px / font-normal</div>
              </div>
              <div>
                <div className="text-xs mb-1">Helper Text</div>
                <div className="text-xs text-gray-500 font-mono">12px / font-normal</div>
              </div>
            </CardContent>
          </Card>

          {/* Spacing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Square className="size-5" />
                Spacing Scale (4/8-based)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((px) => (
                  <div key={px} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-mono text-gray-600">{px}px</div>
                    <div className="h-6 bg-blue-200 rounded" style={{ width: `${px}px` }}></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Core Components */}
        <TabsContent value="components" className="space-y-6">
          {/* Status Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Status Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <StatusBadge status="active" />
                <StatusBadge status="pending" />
                <StatusBadge status="inactive" />
                <StatusBadge status="discharged" />
                <StatusBadge status="success" />
                <StatusBadge status="warning" />
                <StatusBadge status="error" />
              </div>
            </CardContent>
          </Card>

          {/* Metric Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Metric Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <MetricCard
                  title="Active Patients"
                  value="342"
                  subtitle="Home Health & Hospice"
                  trend="up"
                  trendValue="+12%"
                  icon={<Users className="size-5" />}
                />
                <MetricCard
                  title="Pending Visits"
                  value="24"
                  subtitle="Next 7 days"
                  trend="down"
                  trendValue="-8%"
                  icon={<Calendar className="size-5" />}
                  variant="warning"
                />
                <MetricCard
                  title="QA Pass Rate"
                  value="94%"
                  subtitle="Last 30 days"
                  trend="up"
                  trendValue="+3%"
                  icon={<FileText className="size-5" />}
                  variant="success"
                />
                <MetricCard
                  title="Overdue Tasks"
                  value="7"
                  subtitle="Requires attention"
                  icon={<Building2 className="size-5" />}
                  variant="danger"
                />
              </div>
            </CardContent>
          </Card>

          {/* Queue Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Queue Cards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QueueCard
                title="Authorization Renewal Required"
                subtitle="Patient: Johnson, Mary"
                description="Medicare authorization expires in 5 days"
                priority="high"
                status="in_progress"
                dueDate={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}
                assignee="Sarah Johnson"
                labels={[{ text: 'Medicare', variant: 'default' }]}
              />
              <QueueCard
                title="OASIS Assessment Due"
                subtitle="Patient: Smith, John"
                description="Recertification assessment due today"
                priority="critical"
                status="blocked"
                dueDate={new Date()}
                assignee="Emily Chen"
                labels={[
                  { text: 'OASIS-E', variant: 'default' },
                  { text: 'Overdue', variant: 'danger' },
                ]}
              />
            </CardContent>
          </Card>

          {/* Empty State */}
          <Card>
            <CardHeader>
              <CardTitle>Empty State</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Users className="size-16" />}
                title="No patients found"
                description="Get started by adding your first patient to the system"
                action={{
                  label: 'Add Patient',
                  onClick: () => alert('Add patient'),
                  icon: <Plus className="size-4" />,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Healthcare Patterns */}
        <TabsContent value="healthcare" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Admission Summary */}
            <AdmissionSummaryPanel
              admission={{
                id: '1',
                admission_date: '2024-01-15',
                status: 'active',
                service_type: 'Home Health',
                frequency: '3x/week',
                case_manager: 'Sarah Johnson',
                office_name: 'Downtown Office',
                total_visits: 12,
                pending_visits: 3,
              }}
            />

            {/* Payer Summary */}
            <PayerSummaryPanel
              payer={{
                id: '1',
                payer_name: 'Medicare Part A',
                payer_type: 'primary',
                policy_number: '1234567890A',
                group_number: 'GRP-001',
                effective_date: '2024-01-01',
                authorization_required: true,
                authorization_number: 'AUTH-2024-001',
                authorization_start: '2024-01-01',
                authorization_end: '2024-03-31',
                authorized_visits: 20,
                used_visits: 12,
              }}
            />
          </div>

          {/* Authorization Warning */}
          <AuthorizationWarning
            type="expiring"
            patientName="Johnson, Mary"
            payerName="Medicare Part A"
            expirationDate="March 31, 2024"
            authorizationNumber="AUTH-2024-001"
            onAction={() => alert('Request renewal')}
          />

          {/* EVV Status Card */}
          <EVVStatusCard
            data={{
              visit_id: '1',
              patient_name: 'Smith, John',
              visit_date: '2024-03-06',
              visit_time: '10:00 AM',
              clinician_name: 'Emily Chen, RN',
              status: 'verified',
              clock_in_time: '10:02 AM',
              clock_out_time: '11:15 AM',
              clock_in_location: 'Patient Home',
              clock_out_location: 'Patient Home',
              verification_method: 'mobile',
            }}
          />

          {/* HOPE/OASIS Tracker */}
          <HOPEOASISTracker
            patient_name="Johnson, Mary"
            patient_mrn="MRN-12345"
            assessment_type="OASIS-E"
            reason="Recert"
            due_date={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)}
            assigned_clinician="Emily Chen, RN"
          />

          {/* MD Signature Queue */}
          <MDSignatureQueueItem
            patient_name="Williams, Robert"
            patient_mrn="MRN-67890"
            document_type="Plan of Care"
            submitted_date={new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)}
            medical_director="Dr. James Anderson"
            admission_date="Jan 15, 2024"
          />

          {/* Open Shift */}
          <OpenShiftQueueItem
            patient_name="Davis, Linda"
            shift_type="Visit"
            service_line="Skilled Nursing"
            shift_date={new Date(Date.now() + 6 * 60 * 60 * 1000)}
            shift_time="2:00 PM - 3:00 PM"
            location="123 Main St"
          />

          {/* Delayed Visit */}
          <DelayedVisitAlert
            patient_name="Brown, Michael"
            patient_mrn="MRN-11111"
            patient_phone="555-0123"
            scheduled_date={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)}
            scheduled_time="10:00 AM"
            service_type="Physical Therapy"
            assigned_clinician="Tom Wilson, PT"
            delay_reason="Patient Unavailable"
          />

          {/* QA Status Badges */}
          <Card>
            <CardHeader>
              <CardTitle>QA Status Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <QAStatusBadge status="passed" score={95} showScore />
                <QAStatusBadge status="failed" score={72} showScore />
                <QAStatusBadge status="pending" />
                <QAStatusBadge status="needs_review" />
                <QAStatusBadge status="exempt" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layouts */}
        <TabsContent value="layouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Context Header</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientContextHeader
                patient={{
                  id: '1',
                  first_name: 'John',
                  last_name: 'Smith',
                  dob: '1965-05-15',
                  mrn: 'MRN-12345',
                  office_name: 'Downtown Office',
                  status: 'active',
                  phone: '555-0123',
                  admission_status: 'admitted',
                  payer_tags: ['Medicare Part A', 'Medicaid'],
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Split View Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 border border-gray-200 rounded-lg overflow-hidden">
                <SplitViewLayout
                  inspectorOpen={inspectorOpen}
                  onInspectorClose={() => setInspectorOpen(!inspectorOpen)}
                  inspectorTitle="Patient Details"
                  inspector={
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Demographics</h4>
                        <div className="text-sm space-y-1 text-gray-600">
                          <div>DOB: 05/15/1965 (58y)</div>
                          <div>Phone: 555-0123</div>
                          <div>Address: 123 Main St</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Insurance</h4>
                        <div className="text-sm space-y-1 text-gray-600">
                          <div>Medicare Part A</div>
                          <div>Policy: 1234567890A</div>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Primary Content Area</h3>
                    <p className="text-gray-600">
                      This is the main content area. The inspector panel on the right provides
                      additional context without navigating away.
                    </p>
                  </div>
                </SplitViewLayout>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspace Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 border border-gray-200 rounded-lg overflow-hidden">
                <WorkspaceLayout
                  header={
                    <WorkspaceHeader
                      icon={<Calendar className="size-6" />}
                      title="Visit Queue"
                      subtitle="12 visits pending"
                      actions={
                        <Button size="sm">
                          <Plus className="size-4 mr-2" />
                          Schedule Visit
                        </Button>
                      }
                    />
                  }
                  filters={
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-sm text-gray-600">Filter controls here...</div>
                    </div>
                  }
                >
                  <WorkspaceSection
                    title="Today's Visits"
                    subtitle="8 visits scheduled"
                  >
                    <div className="text-gray-600">Visit cards would appear here...</div>
                  </WorkspaceSection>
                </WorkspaceLayout>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
