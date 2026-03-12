/**
 * Caregiver Compliance Integration Demo Page
 * 
 * Complete demonstration of compliance score system, renewal workflow,
 * search/filtering, and Command Center integration.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Shield, Search, RefreshCw, BarChart3 } from 'lucide-react';
import {
  ComplianceScoreBadge,
  ComplianceScoreCard,
  calculateComplianceScore,
  type ComplianceScore,
  type ComplianceIssue,
} from '../components/caregiver/ComplianceScoreSystem';
import CredentialRenewalWorkflow, {
  RenewalStatusIndicator,
  type CredentialRenewal,
} from '../components/caregiver/CredentialRenewalWorkflow';
import CaregiverSearchFilter, {
  type CaregiverSearchResult,
  type CaregiverSearchFilters,
} from '../components/caregiver/CaregiverSearchFilter';
import {
  ComplianceAlertsWidget,
  ComplianceCriticalIssues,
  ComplianceMetricsCard,
  type CaregiverComplianceAlert,
  type ComplianceSummary,
} from '../components/command-center/CaregiverComplianceAlerts';
import { generateMockCredentials } from '../lib/credentialMockData';

export default function CaregiverComplianceIntegrationPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<string>('compliance-score');

  // Generate mock data
  const mockComplianceScore: ComplianceScore = {
    caregiverId: 'caregiver-001',
    caregiverName: 'Sarah Johnson, RN',
    score: 85,
    level: 'minor-issues',
    breakdown: {
      requiredCredentials: {
        total: 4,
        valid: 3,
        expired: 0,
        expiringSoon: 1,
      },
      requiredTraining: {
        total: 4,
        completed: 3,
        overdue: 1,
        expiringSoon: 0,
      },
      optionalCredentials: {
        total: 2,
        valid: 2,
      },
    },
    issues: [
      {
        type: 'expiring-credential',
        severity: 'high',
        description: 'BLS Certification expires in 28 days',
        daysUntilExpiration: 28,
      },
      {
        type: 'overdue-training',
        severity: 'critical',
        description: 'Workplace Safety training overdue by 15 days',
        daysOverdue: 15,
      },
    ],
    lastCalculated: new Date().toISOString(),
    trend: 'stable',
  };

  const mockRenewal: CredentialRenewal = {
    id: 'renewal-001',
    credentialId: 'cred-002',
    credentialType: 'cpr-certification',
    currentExpirationDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    newExpirationDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'document-uploaded',
    uploadedDocumentUrl: '/docs/bls-renewal.pdf',
    uploadedDocumentName: 'BLS Certification Renewal.pdf',
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'Sarah Johnson',
    initiatedBy: 'HR Department',
    initiatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const mockSearchResults: CaregiverSearchResult[] = [
    {
      caregiverId: 'caregiver-001',
      name: 'Sarah Johnson, RN',
      primaryDiscipline: 'SN',
      secondaryDisciplines: ['HHA'],
      office: 'Boston Main',
      credentialStatus: 'expiring-soon',
      complianceScore: { score: 85, level: 'minor-issues' },
      availability: {
        isAvailableToday: true,
        isAvailableThisWeek: true,
      },
      activeRenewals: 1,
    },
    {
      caregiverId: 'caregiver-002',
      name: 'Michael Chen, PT',
      primaryDiscipline: 'PT',
      secondaryDisciplines: [],
      office: 'Boston Main',
      credentialStatus: 'expired',
      complianceScore: { score: 45, level: 'non-compliant' },
      availability: {
        isAvailableToday: false,
        isAvailableThisWeek: true,
      },
      activeRenewals: 0,
    },
    {
      caregiverId: 'caregiver-003',
      name: 'Emily Rodriguez, OT',
      primaryDiscipline: 'OT',
      secondaryDisciplines: [],
      office: 'Cambridge',
      credentialStatus: 'valid',
      complianceScore: { score: 100, level: 'fully-compliant' },
      availability: {
        isAvailableToday: true,
        isAvailableThisWeek: true,
      },
      activeRenewals: 0,
    },
  ];

  const mockAlerts: CaregiverComplianceAlert[] = [
    {
      id: 'alert-001',
      caregiverId: 'caregiver-001',
      caregiverName: 'Sarah Johnson, RN',
      alertType: 'expiring-credential',
      severity: 'high',
      title: 'BLS Certification Expiring',
      description: 'BLS certification expires in 28 days',
      daysUntilExpiration: 28,
      actionUrl: '/caregiver-profile?id=caregiver-001',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert-002',
      caregiverId: 'caregiver-002',
      caregiverName: 'Michael Chen, PT',
      alertType: 'expired-credential',
      severity: 'critical',
      title: 'PT License Expired',
      description: 'Professional license expired 15 days ago',
      daysOverdue: 15,
      actionUrl: '/caregiver-profile?id=caregiver-002',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert-003',
      caregiverId: 'caregiver-001',
      caregiverName: 'Sarah Johnson, RN',
      alertType: 'overdue-training',
      severity: 'critical',
      title: 'Safety Training Overdue',
      description: 'Workplace safety training overdue by 15 days',
      daysOverdue: 15,
      actionUrl: '/caregiver-profile?id=caregiver-001',
      createdAt: new Date().toISOString(),
    },
  ];

  const mockSummary: ComplianceSummary = {
    totalCaregivers: 45,
    compliantCaregivers: 38,
    caregiversWithExpiringCredentials: 5,
    caregiversWithExpiredCredentials: 2,
    caregiversWithMissingTraining: 3,
    overallComplianceRate: 84,
  };

  const credentials = generateMockCredentials('caregiver-001');
  const expiringCredential = credentials.find((c) => c.credentialType === 'cpr-certification')!;

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
                <h1 className="text-xl font-bold text-gray-900">
                  Caregiver Compliance Integration
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Compliance scoring, renewal workflow, search, and Command Center integration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Architecture Overview */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Integration Architecture</h2>
          <p className="text-sm text-gray-600 mb-4">
            Complete compliance system integrating scoring, renewal workflows, search/filtering,
            and Command Center real-time alerts.
          </p>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2 text-sm">Compliance Scoring</h3>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• 0-100 point scale</li>
                <li>• 3 levels (fully/minor/non)</li>
                <li>• Credential + training breakdown</li>
                <li>• Trend tracking (improving/stable/declining)</li>
                <li>• Auto-calculation algorithm</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">Renewal Workflow</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 3-step process (upload/update/review)</li>
                <li>• Document upload + preview</li>
                <li>• Expiration date updates</li>
                <li>• Progress tracking</li>
                <li>• Status indicators</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2 text-sm">Search & Filter</h3>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• Name search</li>
                <li>• Discipline filter</li>
                <li>• Office filter</li>
                <li>• Credential status filter</li>
                <li>• Availability filter</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2 text-sm">Command Center</h3>
              <ul className="text-xs text-orange-800 space-y-1">
                <li>• Critical alerts widget</li>
                <li>• Compliance metrics card</li>
                <li>• Real-time notifications</li>
                <li>• Quick actions</li>
                <li>• Summary dashboard</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Module Selector */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Select Component</h2>
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="compliance-score">
                <Shield className="w-4 h-4 mr-2" />
                Compliance Score
              </TabsTrigger>
              <TabsTrigger value="renewal">
                <RefreshCw className="w-4 h-4 mr-2" />
                Renewal Workflow
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="w-4 h-4 mr-2" />
                Search & Filter
              </TabsTrigger>
              <TabsTrigger value="command-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Command Center
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Compliance Score View */}
        {activeView === 'compliance-score' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Compliance Score System</h2>
              <p className="text-sm text-gray-600 mb-4">
                3-level scoring system (Fully Compliant ≥90%, Minor Issues 70-89%, Non-Compliant
                &lt;70%) with automatic calculation based on credentials and training status.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 text-sm">Scoring Algorithm</h3>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>• Start: 100 points</li>
                    <li>• -20 per expired credential</li>
                    <li>• -5 per expiring credential</li>
                    <li>• -15 per overdue training</li>
                    <li>• -3 per expiring training</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 text-sm">Level Criteria</h3>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• Fully: ≥90% + no expired/missing</li>
                    <li>• Minor: 70-89%</li>
                    <li>• Non-compliant: &lt;70%</li>
                    <li>• Auto-calculated on changes</li>
                    <li>• Trend tracking enabled</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">Display Options</h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Small badge (sm)</li>
                    <li>• Medium inline (md)</li>
                    <li>• Large detailed card (lg)</li>
                    <li>• Dashboard card widget</li>
                    <li>• Profile header badge</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Badge Examples */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Small Badge</h3>
                <ComplianceScoreBadge score={mockComplianceScore} size="sm" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Medium Badge</h3>
                <ComplianceScoreBadge score={mockComplianceScore} size="md" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Dashboard Card</h3>
                <ComplianceScoreCard
                  score={mockComplianceScore}
                  onViewDetails={() => alert('View details')}
                />
              </div>
            </div>

            {/* Large Detailed View */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Large Detailed View</h3>
              <ComplianceScoreBadge
                score={mockComplianceScore}
                size="lg"
                showDetails={true}
                onClick={() => alert('View full compliance report')}
              />
            </div>
          </div>
        )}

        {/* Renewal Workflow View */}
        {activeView === 'renewal' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Credential Renewal Workflow</h2>
              <p className="text-sm text-gray-600 mb-4">
                3-step renewal process: Upload renewal document → Update expiration date → Review
                & approve. Progress tracking with status indicators.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">Step 1: Upload</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Drag & drop or file picker</li>
                    <li>• PDF, JPG, PNG accepted</li>
                    <li>• Auto-save on upload</li>
                    <li>• Upload confirmation</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">Step 2: Update Date</h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Date picker (min: today)</li>
                    <li>• Validation period calculation</li>
                    <li>• Current vs new comparison</li>
                    <li>• Auto-update on save</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 text-sm">Step 3: Review</h3>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>• Document preview</li>
                    <li>• Date verification</li>
                    <li>• Review notes field</li>
                    <li>• Approve/Reject actions</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Workflow Demo */}
            <CredentialRenewalWorkflow
              credential={expiringCredential}
              renewal={mockRenewal}
              onUploadDocument={(file) => alert(`Upload file: ${file.name}`)}
              onUpdateExpiration={(date) => alert(`Update expiration to: ${date}`)}
              onSubmitForReview={() => alert('Submit for review')}
              onApprove={(notes) => alert(`Approved with notes: ${notes}`)}
              onReject={(notes) => alert(`Rejected with notes: ${notes}`)}
            />
          </div>
        )}

        {/* Search & Filter View */}
        {activeView === 'search' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Caregiver Search & Filter</h2>
              <p className="text-sm text-gray-600 mb-4">
                Advanced search with 5 filter categories: Name, Discipline, Office, Credential
                Status, Availability. Real-time filtering with active filter count.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">Search Features</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Real-time name search</li>
                    <li>• Multi-select discipline filter</li>
                    <li>• Office location filter</li>
                    <li>• Credential status (valid/expiring/expired)</li>
                    <li>• Availability (today/this-week/unavailable)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 text-sm">Result Display</h3>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>• Primary + secondary disciplines</li>
                    <li>• Office location badge</li>
                    <li>• Credential status indicator</li>
                    <li>• Compliance score badge</li>
                    <li>• Active renewal count</li>
                    <li>• Available today indicator</li>
                  </ul>
                </div>
              </div>
            </Card>

            <CaregiverSearchFilter
              results={mockSearchResults}
              onSearch={(filters) => console.log('Search:', filters)}
              onSelectCaregiver={(id) => alert(`Navigate to caregiver: ${id}`)}
            />
          </div>
        )}

        {/* Command Center Integration View */}
        {activeView === 'command-center' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Command Center Integration</h2>
              <p className="text-sm text-gray-600 mb-4">
                Real-time compliance alerts integrated into Care Operations Command Center with
                critical issues panel, metrics card, and sidebar widget.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2 text-sm">Critical Issues Panel</h3>
                  <ul className="text-xs text-red-800 space-y-1">
                    <li>• Top 5 critical alerts</li>
                    <li>• Expired credentials</li>
                    <li>• Overdue training</li>
                    <li>• Low compliance scores</li>
                    <li>• Quick action links</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">Metrics Card</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Overall compliance rate</li>
                    <li>• Compliant count</li>
                    <li>• Expiring soon count</li>
                    <li>• Expired count</li>
                    <li>• Missing training count</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">Sidebar Widget</h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Compliance rate summary</li>
                    <li>• Critical alert count</li>
                    <li>• High priority count</li>
                    <li>• Top 3 alerts</li>
                    <li>• View all link</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Critical Issues Panel */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Critical Issues Panel</h3>
              <ComplianceCriticalIssues
                alerts={mockAlerts}
                onViewAlert={(id) => alert(`View alert: ${id}`)}
                onViewAll={() => alert('View all compliance issues')}
              />
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-3 gap-6">
              {/* Metrics Card */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Metrics Card</h3>
                <ComplianceMetricsCard
                  summary={mockSummary}
                  onClick={() => alert('View compliance dashboard')}
                />
              </div>

              {/* Sidebar Widget */}
              <div className="col-span-2">
                <h3 className="font-semibold text-gray-900 mb-3">Sidebar Widget</h3>
                <ComplianceAlertsWidget
                  alerts={mockAlerts}
                  summary={mockSummary}
                  onViewAll={() => alert('View all alerts')}
                  onViewAlert={(id) => alert(`View alert: ${id}`)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
