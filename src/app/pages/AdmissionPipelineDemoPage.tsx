/**
 * Admission Pipeline Demo Page
 * 
 * Demonstrates the admission pipeline workspace with mock data
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import AdmissionPipeline from '../components/admission/AdmissionPipeline';
import {
  Info,
  CheckCircle2,
  TrendingUp,
  Zap,
  Users,
  Target,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';

export default function AdmissionPipelineDemoPage() {
  const navigate = useNavigate();

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="size-8 text-blue-600" />
            Admission Pipeline Workspace
          </h1>
          <p className="text-gray-600 mt-2">
            Kanban-style pipeline for intake coordinators to manage admissions from referral to care start
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Admission Pipeline</p>
                <p className="mt-1 text-blue-800">
                  The Admission Pipeline provides a <strong>visual Kanban board</strong> to track admissions
                  through 5 stages (New Referral → Admission Setup → Pending Authorization → Ready for Care → Admitted).
                  Each admission card displays key information (patient, payer, coordinator, readiness status) and can be{' '}
                  <strong>dragged between stages</strong> as requirements are completed. Built with react-dnd for smooth
                  drag & drop interactions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Stages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">5 Pipeline Stages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <StageCard
                number={1}
                title="New Referral"
                description="Initial referral received, not yet started"
                color="blue"
              />
              <StageCard
                number={2}
                title="Admission Setup"
                description="Gathering required information"
                color="purple"
              />
              <StageCard
                number={3}
                title="Pending Authorization"
                description="Waiting for payer authorization"
                color="amber"
              />
              <StageCard
                number={4}
                title="Ready for Care"
                description="All requirements met, ready to start"
                color="green"
              />
              <StageCard
                number={5}
                title="Admitted"
                description="Patient has started care"
                color="gray"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Admission Card Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Displayed on Each Card:</h4>
                <ul className="space-y-2">
                  <InfoItem label="Patient Name" value="Full name and MRN" />
                  <InfoItem label="Admission Date" value="Start of care or referral date" />
                  <InfoItem label="Primary Payer" value="Insurance provider name" />
                  <InfoItem label="Assigned Coordinator" value="Intake coordinator name" />
                  <InfoItem label="Readiness Status" value="Draft, Pending, Ready, Blocked" />
                  <InfoItem label="Priority Level" value="Low, Medium, High, Urgent" />
                  <InfoItem label="Days in Stage" value="Time spent in current stage" />
                  <InfoItem label="Blockers" value="Count of critical blockers (if any)" />
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Example Card:</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-sm">Mary Johnson</h5>
                      <p className="text-xs text-gray-600">MRN: 10001</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500 text-white text-xs mb-3">⏰ Pending Setup</Badge>
                  <div className="space-y-1.5 text-xs mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">📅</span>
                      <span className="text-gray-700">SOC: 03/15/2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">🛡️</span>
                      <span className="text-gray-700">Medicare Part A</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">👤</span>
                      <span className="text-gray-700">Sarah Chen</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">HIGH</Badge>
                    <span className="text-xs text-gray-600">3 days in stage</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={LayoutGrid}
                title="Drag & Drop Interface"
                description="Move admission cards between stages with smooth drag & drop powered by react-dnd"
              />
              <FeatureCard
                icon={Target}
                title="Readiness Integration"
                description="Each card shows readiness status (Draft, Pending Setup, Ready, Blocked) with visual badges"
              />
              <FeatureCard
                icon={Users}
                title="Advanced Filtering"
                description="Filter by coordinator, payer type, service type, or search by patient name/MRN"
              />
              <FeatureCard
                icon={CheckCircle2}
                title="Priority Management"
                description="Visual priority indicators (Low, Medium, High, Urgent) with color coding"
              />
              <FeatureCard
                icon={Zap}
                title="Real-Time Stats"
                description="Dashboard stats showing total admissions, blockers, urgent cases, avg days in stage"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Stage Analytics"
                description="Each column shows count of admissions in that stage for quick visibility"
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
              number={1}
              title="Daily Pipeline Review"
              scenario="Intake coordinator starts their day"
              steps={[
                'Open pipeline workspace to see all active admissions',
                'Review "New Referral" column for new cases',
                'Check "Pending Authorization" for any approvals received',
                'Move cards to appropriate stages as work progresses',
                'Prioritize urgent cases (red badges)',
              ]}
              benefit="Clear visual overview of all active work"
            />

            <UseCaseCard
              number={2}
              title="Authorization Received"
              scenario="Payer approves authorization"
              steps={[
                'Coordinator receives auth approval email',
                'Locate admission card in "Pending Authorization" stage',
                'Verify all other requirements are complete',
                'Drag card to "Ready for Care" stage',
                'System updates timestamp and notifies scheduler',
              ]}
              benefit="Immediate visibility of care-ready admissions"
            />

            <UseCaseCard
              number={3}
              title="Blocker Resolution"
              scenario="Admission has critical blocker"
              steps={[
                'Card shows red "2 Blockers" badge',
                'Coordinator clicks card to view details',
                'Sees specific blockers (e.g., "Physician orders missing")',
                'Resolves issues and updates admission',
                'Card automatically updates to remove blocker badge',
                'Drag to next appropriate stage',
              ]}
              benefit="Quick identification and resolution of blockers"
            />

            <UseCaseCard
              number={4}
              title="Coordinator Workload Management"
              scenario="Manager reviewing team workload"
              steps={[
                'Filter by coordinator name',
                'See all admissions assigned to specific coordinator',
                'Check distribution across stages',
                'Identify bottlenecks (too many in one stage)',
                'Reassign admissions to balance workload',
              ]}
              benefit="Balanced workload distribution across team"
            />
          </CardContent>
        </Card>

        {/* Live Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Interactive Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900">
                  <p className="font-semibold">Try It Out!</p>
                  <p className="mt-1 text-green-800">
                    The pipeline below contains 24 mock admissions across all 5 stages. Try:
                  </p>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-green-800">
                    <li>Dragging cards between stages</li>
                    <li>Using the search and filters</li>
                    <li>Clicking the menu (⋮) on any card for actions</li>
                    <li>Observing readiness badges and blocker indicators</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline */}
        <div className="border-4 border-blue-200 rounded-lg p-2 bg-white">
          <AdmissionPipeline />
        </div>

        {/* Implementation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Ready to Use</p>
                <p className="mt-1 text-green-800">
                  Import <code className="bg-green-200 px-1 py-0.5 rounded">AdmissionPipeline</code>{' '}
                  from <code className="bg-green-200 px-1 py-0.5 rounded">@/components/admission</code>.
                  The component uses react-dnd for drag & drop, integrates with the Admission Readiness
                  system, and includes filtering, search, and stats. Fully typed with TypeScript.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-blue-600">5</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Pipeline Stages</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-green-600">8</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Card Details</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">4</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Filter Options</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-orange-600">4</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Priority Levels</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-red-600">∞</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Admissions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

interface StageCardProps {
  number: number;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'amber' | 'green' | 'gray';
}

function StageCard({ number, title, description, color }: StageCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    amber: 'bg-amber-100 text-amber-700 border-amber-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return (
    <div className={`p-4 border-2 rounded-lg ${colorClasses[color]}`}>
      <div className="size-8 rounded-full bg-white flex items-center justify-center font-bold mb-3">
        {number}
      </div>
      <h4 className="font-semibold text-sm mb-2">{title}</h4>
      <p className="text-xs opacity-90">{description}</p>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-medium text-gray-900">{label}:</span>
        <span className="text-gray-600 ml-1">{value}</span>
      </div>
    </li>
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

interface UseCaseCardProps {
  number: number;
  title: string;
  scenario: string;
  steps: string[];
  benefit: string;
}

function UseCaseCard({ number, title, scenario, steps, benefit }: UseCaseCardProps) {
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
        <ol className="space-y-1.5 mb-3">
          {steps.map((step, index) => (
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