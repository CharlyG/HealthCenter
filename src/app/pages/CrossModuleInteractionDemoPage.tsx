/**
 * Cross-Module Interaction Demo Page
 * 
 * Demonstrates seamless navigation between related records
 * without losing context.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  QuickViewDrawer,
  ContextualLink,
  RelatedRecordsPanel,
  ContextualBreadcrumb,
  type QuickViewConfig,
  type RelatedRecord,
} from '../components/cross-module/CrossModulePatterns';
import {
  Info,
  CheckCircle2,
  Zap,
  Eye,
  MousePointer,
  Layout,
  Link,
  Layers,
} from 'lucide-react';

export default function CrossModuleInteractionDemoPage() {
  const [quickViewConfig, setQuickViewConfig] = useState<QuickViewConfig | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleQuickView = (config: QuickViewConfig) => {
    setQuickViewConfig(config);
    setIsDrawerOpen(true);
  };

  // Mock data
  const mockPatientData = {
    name: 'Johnson, Mary Elizabeth',
    mrn: '001234',
    dob: '1945-01-15',
    age: 79,
    gender: 'Female',
    phone: '(555) 123-4567',
    address: '123 Main St, Springfield, IL 62701',
    path: '/patient/PT-001234',
    activeAdmissions: [
      { id: 'ADM-2024-001', type: 'Home Health', day: 42 },
    ],
    diagnoses: [
      'CHF Exacerbation',
      'Diabetes Type 2',
      'Hypertension',
    ],
  };

  const mockAdmissionData = {
    admissionId: 'ADM-2024-001',
    patientName: 'Johnson, Mary',
    status: 'Active',
    startDate: '02/01/2024',
    dayInEpisode: 42,
    primaryPayer: 'Medicare',
    episodeNumber: 1,
    primaryDiagnosis: 'CHF Exacerbation, Diabetes Type 2',
    path: '/admissions/ADM-2024-001',
    recentVisits: [
      { id: 'V-001', discipline: 'RN', type: 'Skilled Nursing', date: '03/08/2024' },
      { id: 'V-002', discipline: 'PT', type: 'Physical Therapy', date: '03/06/2024' },
    ],
  };

  const mockVisitData = {
    discipline: 'RN',
    visitType: 'Skilled Nursing Visit',
    patientName: 'Johnson, Mary',
    status: 'completed',
    date: '03/10/2024',
    time: '9:00 AM',
    clinician: 'Sarah Thompson, RN',
    admissionId: 'ADM-2024-001',
    path: '/poc/visit/V-12345',
    notes: 'Patient stable. CHF symptoms well controlled. Continues with medications as prescribed. Educated on fluid restriction and daily weights.',
    vitals: {
      bp: '128/78',
      hr: '72',
      temp: '98.6',
      o2: '96',
    },
  };

  const relatedRecords: RelatedRecord[] = [
    {
      id: 'ADM-2024-001',
      type: 'admission',
      title: 'ADM-2024-001',
      subtitle: 'Active • Day 42/60',
      metadata: { payer: 'Medicare' },
      onQuickView: () => handleQuickView({
        id: 'ADM-2024-001',
        type: 'admission',
        title: 'ADM-2024-001',
        subtitle: 'Johnson, Mary',
        data: mockAdmissionData,
      }),
    },
    {
      id: 'V-001',
      type: 'visit',
      title: 'RN Visit - 03/08/2024',
      subtitle: 'Sarah Thompson, RN',
      metadata: { status: 'Completed' },
      onQuickView: () => handleQuickView({
        id: 'V-001',
        type: 'visit',
        title: 'Skilled Nursing Visit',
        subtitle: 'Johnson, Mary',
        data: mockVisitData,
      }),
    },
    {
      id: 'AUTH-001',
      type: 'authorization',
      title: 'AUTH-2024-12345',
      subtitle: 'Medicare',
      metadata: { visits: '12/20 used' },
      onQuickView: () => handleQuickView({
        id: 'AUTH-001',
        type: 'authorization',
        title: 'AUTH-2024-12345',
        subtitle: 'Johnson, Mary',
        data: {
          authNumber: 'AUTH-2024-12345',
          patientName: 'Johnson, Mary',
          status: 'approved',
          payer: 'Medicare',
          validThrough: '04/01/2024',
          visitsAuthorized: 20,
          visitsUsed: 12,
          visitsRemaining: 8,
          services: ['Skilled Nursing', 'Physical Therapy', 'Occupational Therapy'],
        },
      }),
    },
  ];

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="size-8 text-blue-600" />
            Cross-Module Interaction Patterns
          </h1>
          <p className="text-gray-600 mt-2">
            Seamless navigation between related records without losing context
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Cross-Module Interactions</p>
                <p className="mt-1 text-blue-800">
                  Users can navigate between related records using <strong>Quick View Drawers</strong>{' '}
                  (side panels), <strong>Contextual Links</strong> (smart links with quick view),
                  and <strong>Related Records Panels</strong> (widgets). This reduces navigation
                  friction by allowing users to view related information without leaving their
                  current screen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interaction Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interaction Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PatternCard
                icon={Layout}
                title="Quick View Drawer"
                description="Side panel showing full record details without navigation"
                example="View patient chart from visit"
              />
              <PatternCard
                icon={Link}
                title="Contextual Links"
                description="Smart links that open quick views or navigate directly"
                example="Click patient name to view details"
              />
              <PatternCard
                icon={Eye}
                title="Related Records Panel"
                description="Widget displaying all related items with quick access"
                example="See all visits for admission"
              />
            </div>
          </CardContent>
        </Card>

        {/* Demo: Contextual Breadcrumb */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contextual Breadcrumb Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <ContextualBreadcrumb
              items={[
                { label: 'Patients', path: '/patient' },
                { label: 'Johnson, Mary', path: '/patient/PT-001234' },
                { label: 'ADM-2024-001', path: '/admissions/ADM-2024-001' },
                { label: 'Visit #12345', isCurrent: true },
              ]}
            />
            <p className="text-sm text-gray-600 mt-3">
              Breadcrumbs show the navigation path and allow quick navigation back to parent records.
            </p>
          </CardContent>
        </Card>

        {/* Demo: Contextual Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contextual Links (Click to Quick View)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <p className="text-sm text-gray-700 mb-3">
                <strong>Example Scenario:</strong> You're viewing a visit and want to see the
                patient's full chart:
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700">Visit for patient:</span>
                <ContextualLink
                  type="patient"
                  id="PT-001234"
                  label="Johnson, Mary"
                  data={mockPatientData}
                  onQuickView={handleQuickView}
                />
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <p className="text-sm text-gray-700 mb-3">
                <strong>Example Scenario:</strong> You're reviewing a claim and want to see the
                admission details:
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700">Claim for admission:</span>
                <ContextualLink
                  type="admission"
                  id="ADM-2024-001"
                  label="ADM-2024-001"
                  data={mockAdmissionData}
                  onQuickView={handleQuickView}
                />
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <p className="text-sm text-gray-700 mb-3">
                <strong>Example Scenario:</strong> You're on the dashboard and see an alert about
                a visit:
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700">Alert for visit:</span>
                <ContextualLink
                  type="visit"
                  id="V-12345"
                  label="RN Visit - 03/10/2024"
                  data={mockVisitData}
                  onQuickView={handleQuickView}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo: Related Records Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related Records Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RelatedRecordsPanel
                title="Related to Patient"
                records={relatedRecords}
                onQuickView={handleQuickView}
              />
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  <strong>Use Case:</strong> When viewing a patient chart, show all related
                  admissions, visits, and authorizations in a panel for quick access.
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Features:</strong>
                </p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Click item to navigate to full record</li>
                  <li>• Click eye icon for quick view drawer</li>
                  <li>• Shows key metadata (status, dates, etc.)</li>
                  <li>• Icon-coded by record type</li>
                </ul>
              </div>
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
              number={1}
              title="Visit → Patient Chart"
              scenario="RN documenting visit needs to review patient allergies"
              flow={[
                'RN opens visit documentation form',
                'Clicks patient name link',
                'Quick View Drawer opens showing patient chart',
                'Reviews allergies and medications',
                'Closes drawer and continues documenting',
              ]}
              benefit="No navigation away from visit form - context preserved"
            />

            <UseCaseCard
              number={2}
              title="Claim → Admission Details"
              scenario="Billing specialist reviewing rejected claim needs admission info"
              flow={[
                'Opens rejected claim in queue',
                'Clicks admission ID link',
                'Quick View shows admission with visit count, auth status',
                'Identifies missing OASIS assessment',
                'Clicks "Open Full View" to fix issue',
              ]}
              benefit="Fast diagnosis of claim issue without losing place in queue"
            />

            <UseCaseCard
              number={3}
              title="Alert → Documentation"
              scenario="Case manager sees alert about overdue documentation"
              flow={[
                'Dashboard shows alert: "Overdue OASIS Assessment"',
                'Clicks alert link',
                'Quick View opens showing assessment status',
                'Sees assigned clinician and due date',
                'Assigns reminder to clinician',
              ]}
              benefit="Quick triage of alert without leaving dashboard"
            />

            <UseCaseCard
              number={4}
              title="Patient → Related Visits"
              scenario="Physician reviewing patient needs to see recent visit history"
              flow={[
                'Opens patient chart',
                'Related Records Panel shows last 5 visits',
                'Clicks eye icon on recent RN visit',
                'Quick View shows visit notes and vitals',
                'Reviews clinical progress',
              ]}
              benefit="Comprehensive patient review from single screen"
            />
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BenefitCard
                icon={Zap}
                title="Reduced Navigation Friction"
                description="View related records without losing context or navigating away"
              />
              <BenefitCard
                icon={Eye}
                title="Quick Information Access"
                description="See essential details in seconds via quick view drawers"
              />
              <BenefitCard
                icon={MousePointer}
                title="One-Click Operations"
                description="Direct links to related records with smart routing"
              />
              <BenefitCard
                icon={Layers}
                title="Context Preservation"
                description="Stay on current task while viewing related information"
              />
            </div>
          </CardContent>
        </Card>

        {/* Implementation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Ready to Use</p>
                <p className="mt-1 text-green-800">
                  Import <code className="bg-green-200 px-1 py-0.5 rounded">QuickViewDrawer</code>,{' '}
                  <code className="bg-green-200 px-1 py-0.5 rounded">ContextualLink</code>, and{' '}
                  <code className="bg-green-200 px-1 py-0.5 rounded">RelatedRecordsPanel</code>{' '}
                  from <code className="bg-green-200 px-1 py-0.5 rounded">@/components/cross-module</code>.
                  The system supports 6 record types and is fully responsive.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick View Drawer */}
      {quickViewConfig && (
        <QuickViewDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          config={quickViewConfig}
          size="lg"
        />
      )}
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

interface PatternCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  example: string;
}

function PatternCard({ icon: Icon, title, description, example }: PatternCardProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
        <Icon className="size-6 text-blue-600" />
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-2">{title}</h3>
      <p className="text-xs text-gray-600 mb-3">{description}</p>
      <div className="bg-gray-50 rounded p-2">
        <p className="text-xs text-gray-700">
          <strong>Example:</strong> {example}
        </p>
      </div>
    </div>
  );
}

interface UseCaseCardProps {
  number: number;
  title: string;
  scenario: string;
  flow: string[];
  benefit: string;
}

function UseCaseCard({ number, title, scenario, flow, benefit }: UseCaseCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start gap-3 mb-3">
        <div className="size-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
          {number}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{scenario}</p>
        </div>
      </div>
      <div className="ml-11">
        <p className="text-xs font-semibold text-gray-700 mb-2">Flow:</p>
        <ol className="space-y-1 mb-3">
          {flow.map((step, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-blue-600 font-semibold">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <p className="text-sm text-green-800">
            <CheckCircle2 className="size-4 inline mr-1" />
            <strong>Benefit:</strong> {benefit}
          </p>
        </div>
      </div>
    </div>
  );
}

interface BenefitCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function BenefitCard({ icon: Icon, title, description }: BenefitCardProps) {
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
