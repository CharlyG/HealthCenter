/**
 * Clinical Compliance Monitor
 * 
 * Detects and displays compliance issues across the organization
 * - Missing documentation
 * - Unsigned orders
 * - Incomplete assessments
 * - Visit documentation overdue
 * 
 * Displays in operational queues with direct access to documents
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  FileX,
  PenOff,
  ClipboardX,
  Clock,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Activity,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  CheckSquare,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ComplianceIssueType = 
  | 'missing_documentation'
  | 'unsigned_order'
  | 'incomplete_assessment'
  | 'overdue_visit_documentation';

type ComplianceSeverity = 'critical' | 'high' | 'medium' | 'low';

type ComplianceStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';

interface ComplianceIssue {
  id: string;
  type: ComplianceIssueType;
  severity: ComplianceSeverity;
  status: ComplianceStatus;
  
  // Patient context
  patientId: string;
  patientName: string;
  patientMRN: string;
  admissionId?: string;
  episodeId?: string;
  
  // Issue details
  title: string;
  description: string;
  
  // Document reference
  documentType?: string;
  documentId?: string;
  documentUrl?: string;
  
  // Assignment
  assignedTo?: string;
  assignedToRole?: string;
  discipline?: string;
  
  // Timing
  dueDate?: string;
  overdueBy?: number; // days overdue
  detectedDate: string;
  resolvedDate?: string;
  
  // Additional context
  visitDate?: string;
  visitType?: string;
  orderType?: string;
  assessmentType?: string;
  
  // Compliance metrics
  regulatoryRequirement?: string;
  potentialImpact?: string;
  
  // Actions taken
  lastAction?: string;
  lastActionDate?: string;
  lastActionBy?: string;
}

interface ComplianceMetrics {
  totalIssues: number;
  criticalIssues: number;
  highPriorityIssues: number;
  openIssues: number;
  overdueIssues: number;
  resolvedToday: number;
  resolutionRate: number; // percentage
  averageResolutionTime: number; // hours
  
  // By type
  missingDocumentation: number;
  unsignedOrders: number;
  incompleteAssessments: number;
  overdueVisitDocs: number;
  
  // Trends
  trend: 'improving' | 'stable' | 'worsening';
  trendPercentage: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_COMPLIANCE_ISSUES: ComplianceIssue[] = [
  // Critical - Unsigned Orders
  {
    id: 'ci-001',
    type: 'unsigned_order',
    severity: 'critical',
    status: 'open',
    patientId: 'pat-001',
    patientName: 'Margaret Johnson',
    patientMRN: 'MRN-334455',
    admissionId: 'adm-001',
    title: 'Verbal Order - Unsigned for 48+ Hours',
    description: 'Verbal order for insulin dosage change requires physician signature within 48 hours per CMS guidelines',
    documentType: 'Verbal Order',
    documentId: 'vo-001',
    documentUrl: '/physician-orders-module?document=vo-001',
    assignedTo: 'Dr. Sarah Chen',
    assignedToRole: 'Physician',
    dueDate: '2026-03-07',
    overdueBy: 2,
    detectedDate: '2026-03-08',
    orderType: 'Verbal Order - Medication Change',
    regulatoryRequirement: 'CMS CoP §484.60 - Verbal orders must be signed within 48 hours',
    potentialImpact: 'High - May result in survey citation and claim denial',
    lastAction: 'Reminder sent to physician',
    lastActionDate: '2026-03-09T08:00:00Z',
    lastActionBy: 'Clinical Supervisor',
  },
  {
    id: 'ci-002',
    type: 'unsigned_order',
    severity: 'critical',
    status: 'in_progress',
    patientId: 'pat-002',
    patientName: 'Robert Williams',
    patientMRN: 'MRN-445566',
    admissionId: 'adm-002',
    title: 'Plan of Care - Missing Physician Signature',
    description: 'Initial Plan of Care established but requires physician signature before recertification period',
    documentType: 'Plan of Care',
    documentId: 'poc-001',
    documentUrl: '/plan-of-care-module?document=poc-001',
    assignedTo: 'Dr. Michael Torres',
    assignedToRole: 'Physician',
    dueDate: '2026-03-10',
    overdueBy: 0,
    detectedDate: '2026-03-05',
    orderType: 'Plan of Care',
    regulatoryRequirement: 'CMS CoP §484.60 - POC must be signed by physician',
    potentialImpact: 'Critical - Cannot bill for services without signed POC',
    lastAction: 'Faxed to physician office',
    lastActionDate: '2026-03-09T10:30:00Z',
    lastActionBy: 'Clinical Coordinator',
  },
  
  // High - Incomplete Assessments
  {
    id: 'ci-003',
    type: 'incomplete_assessment',
    severity: 'high',
    status: 'open',
    patientId: 'pat-003',
    patientName: 'Dorothy Anderson',
    patientMRN: 'MRN-556677',
    admissionId: 'adm-003',
    title: 'OASIS SOC Assessment - Incomplete',
    description: 'Start of Care OASIS assessment started but not completed. Missing M1800-M2000 sections',
    documentType: 'OASIS-E Assessment',
    documentId: 'oasis-001',
    documentUrl: '/oasis-assessment?document=oasis-001',
    assignedTo: 'Jennifer Martinez, RN',
    assignedToRole: 'RN',
    discipline: 'SN',
    dueDate: '2026-03-10',
    overdueBy: 0,
    detectedDate: '2026-03-08',
    assessmentType: 'SOC',
    regulatoryRequirement: 'CMS - OASIS must be completed within 5 days of SOC',
    potentialImpact: 'High - Cannot lock episode for billing without complete OASIS',
    lastAction: 'Assigned to completing clinician',
    lastActionDate: '2026-03-09T09:00:00Z',
    lastActionBy: 'System',
  },
  {
    id: 'ci-004',
    type: 'incomplete_assessment',
    severity: 'high',
    status: 'open',
    patientId: 'pat-004',
    patientName: 'James Wilson',
    patientMRN: 'MRN-667788',
    admissionId: 'adm-004',
    title: 'PT Evaluation - Missing Treatment Plan',
    description: 'PT evaluation completed but treatment plan section is blank',
    documentType: 'PT Evaluation',
    documentId: 'pt-eval-001',
    documentUrl: '/physical-therapy-module?document=pt-eval-001',
    assignedTo: 'Michael Rodriguez, PT',
    assignedToRole: 'PT',
    discipline: 'PT',
    dueDate: '2026-03-09',
    overdueBy: 1,
    detectedDate: '2026-03-08',
    assessmentType: 'PT Evaluation',
    regulatoryRequirement: 'Professional standards require complete evaluation with plan',
    potentialImpact: 'Medium - May affect treatment authorization',
  },
  
  // High - Overdue Visit Documentation
  {
    id: 'ci-005',
    type: 'overdue_visit_documentation',
    severity: 'high',
    status: 'open',
    patientId: 'pat-005',
    patientName: 'Patricia Brown',
    patientMRN: 'MRN-778899',
    admissionId: 'adm-005',
    title: 'SN Visit Note - 5 Days Overdue',
    description: 'Skilled nursing visit completed 3/4/2026 but documentation not submitted',
    documentType: 'SN Visit Note',
    documentId: 'sn-visit-001',
    documentUrl: '/skilled-nursing-module?document=sn-visit-001',
    assignedTo: 'Lisa Thompson, RN',
    assignedToRole: 'RN',
    discipline: 'SN',
    visitDate: '2026-03-04',
    visitType: 'Routine Visit',
    dueDate: '2026-03-07',
    overdueBy: 5,
    detectedDate: '2026-03-07',
    regulatoryRequirement: 'Agency policy - Visit documentation due within 72 hours',
    potentialImpact: 'High - Extended delay may indicate quality issues',
    lastAction: 'Email reminder sent',
    lastActionDate: '2026-03-09T07:00:00Z',
    lastActionBy: 'System',
  },
  {
    id: 'ci-006',
    type: 'overdue_visit_documentation',
    severity: 'medium',
    status: 'open',
    patientId: 'pat-006',
    patientName: 'Charles Davis',
    patientMRN: 'MRN-889900',
    admissionId: 'adm-006',
    title: 'OT Visit Note - 3 Days Overdue',
    description: 'Occupational therapy visit on 3/6/2026 pending documentation',
    documentType: 'OT Visit Note',
    documentId: 'ot-visit-001',
    documentUrl: '/occupational-therapy-module?document=ot-visit-001',
    assignedTo: 'Karen Lee, OT',
    assignedToRole: 'OT',
    discipline: 'OT',
    visitDate: '2026-03-06',
    visitType: 'Routine Visit',
    dueDate: '2026-03-09',
    overdueBy: 3,
    detectedDate: '2026-03-09',
    regulatoryRequirement: 'Agency policy - Visit documentation due within 72 hours',
    potentialImpact: 'Medium - May delay billing submission',
  },
  
  // Medium - Missing Documentation
  {
    id: 'ci-007',
    type: 'missing_documentation',
    severity: 'medium',
    status: 'open',
    patientId: 'pat-007',
    patientName: 'Mary Martinez',
    patientMRN: 'MRN-990011',
    admissionId: 'adm-007',
    title: 'Patient Education - No Documentation',
    description: 'Multiple visits completed but no patient education documentation on file',
    documentType: 'Patient Education',
    documentUrl: '/clinical-documentation-workspace?patient=pat-007',
    assignedTo: 'Primary Nurse',
    assignedToRole: 'RN',
    discipline: 'SN',
    dueDate: '2026-03-12',
    overdueBy: 0,
    detectedDate: '2026-03-08',
    regulatoryRequirement: 'CMS CoP - Patient/caregiver education must be documented',
    potentialImpact: 'Medium - Survey deficiency potential',
  },
  {
    id: 'ci-008',
    type: 'missing_documentation',
    severity: 'medium',
    status: 'open',
    patientId: 'pat-008',
    patientName: 'David Garcia',
    patientMRN: 'MRN-001122',
    admissionId: 'adm-008',
    title: 'Medication Reconciliation - Not Completed',
    description: 'Patient admitted 2 weeks ago, medication reconciliation not documented',
    documentType: 'Medication Reconciliation',
    documentUrl: '/clinical-documentation-workspace?patient=pat-008',
    assignedTo: 'Maria Santos, RN',
    assignedToRole: 'RN',
    discipline: 'SN',
    dueDate: '2026-03-15',
    overdueBy: 0,
    detectedDate: '2026-03-09',
    regulatoryRequirement: 'CMS CoP - Med reconciliation required at admission and changes',
    potentialImpact: 'Medium - Patient safety and compliance concern',
  },
  
  // Low - Routine Documentation Gaps
  {
    id: 'ci-009',
    type: 'missing_documentation',
    severity: 'low',
    status: 'open',
    patientId: 'pat-009',
    patientName: 'Susan Rodriguez',
    patientMRN: 'MRN-112233',
    admissionId: 'adm-009',
    title: 'Progress Note - Approaching Due Date',
    description: 'Weekly progress note due in 2 days',
    documentType: 'Progress Note',
    documentUrl: '/skilled-nursing-module',
    assignedTo: 'Primary Clinician',
    assignedToRole: 'RN',
    discipline: 'SN',
    dueDate: '2026-03-11',
    overdueBy: 0,
    detectedDate: '2026-03-09',
    regulatoryRequirement: 'Agency policy - Weekly progress documentation',
    potentialImpact: 'Low - Routine documentation requirement',
  },
  {
    id: 'ci-010',
    type: 'incomplete_assessment',
    severity: 'low',
    status: 'resolved',
    patientId: 'pat-010',
    patientName: 'Thomas Lee',
    patientMRN: 'MRN-223344',
    admissionId: 'adm-010',
    title: 'Wound Assessment - Completed',
    description: 'Wound assessment completed and signed',
    documentType: 'Wound Assessment',
    documentId: 'wound-001',
    documentUrl: '/wound-care-module?document=wound-001',
    assignedTo: 'Jennifer Adams, RN',
    assignedToRole: 'RN',
    discipline: 'SN',
    dueDate: '2026-03-09',
    detectedDate: '2026-03-08',
    resolvedDate: '2026-03-09T11:00:00Z',
    assessmentType: 'Wound Assessment',
    status: 'resolved',
    lastAction: 'Document completed and signed',
    lastActionDate: '2026-03-09T11:00:00Z',
    lastActionBy: 'Jennifer Adams, RN',
  },
];

const MOCK_METRICS: ComplianceMetrics = {
  totalIssues: 9,
  criticalIssues: 2,
  highPriorityIssues: 4,
  openIssues: 8,
  overdueIssues: 4,
  resolvedToday: 1,
  resolutionRate: 87.5,
  averageResolutionTime: 14.5,
  
  missingDocumentation: 3,
  unsignedOrders: 2,
  incompleteAssessments: 2,
  overdueVisitDocs: 2,
  
  trend: 'improving',
  trendPercentage: 12.5,
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ClinicalComplianceMonitor() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<ComplianceSeverity | 'all'>('all');
  const [selectedType, setSelectedType] = useState<ComplianceIssueType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ComplianceStatus | 'all'>('open');
  const [selectedTab, setSelectedTab] = useState<'all' | ComplianceIssueType>('all');

  // Filter issues
  const filteredIssues = useMemo(() => {
    return MOCK_COMPLIANCE_ISSUES.filter(issue => {
      const matchesSearch = 
        issue.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.patientMRN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity = selectedSeverity === 'all' || issue.severity === selectedSeverity;
      const matchesType = selectedType === 'all' || issue.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
      const matchesTab = selectedTab === 'all' || issue.type === selectedTab;

      return matchesSearch && matchesSeverity && matchesType && matchesStatus && matchesTab;
    });
  }, [searchTerm, selectedSeverity, selectedType, selectedStatus, selectedTab]);

  // Sort by severity and overdue
  const sortedIssues = useMemo(() => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...filteredIssues].sort((a, b) => {
      // First by status (open first)
      if (a.status !== b.status) {
        return a.status === 'open' ? -1 : 1;
      }
      // Then by severity
      if (a.severity !== b.severity) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      // Then by overdue
      return (b.overdueBy || 0) - (a.overdueBy || 0);
    });
  }, [filteredIssues]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Clinical Compliance Monitor
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Real-time monitoring of documentation compliance and regulatory requirements
          </p>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="p-6 border-b bg-white">
        <ComplianceMetricsDashboard metrics={MOCK_METRICS} />
      </div>

      {/* Filters */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, MRN, or issue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={selectedSeverity} onValueChange={(v) => setSelectedSeverity(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs for Issue Types */}
      <div className="bg-white border-b">
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
          <div className="px-6">
            <TabsList>
              <TabsTrigger value="all">
                All Issues
                <Badge className="ml-2 bg-gray-200 text-gray-700">
                  {MOCK_COMPLIANCE_ISSUES.filter(i => selectedStatus === 'all' || i.status === selectedStatus).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unsigned_order">
                <PenOff className="w-4 h-4 mr-2" />
                Unsigned Orders
                <Badge className="ml-2 bg-red-100 text-red-700">
                  {MOCK_METRICS.unsignedOrders}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="overdue_visit_documentation">
                <Clock className="w-4 h-4 mr-2" />
                Overdue Visits
                <Badge className="ml-2 bg-amber-100 text-amber-700">
                  {MOCK_METRICS.overdueVisitDocs}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="incomplete_assessment">
                <ClipboardX className="w-4 h-4 mr-2" />
                Incomplete Assessments
                <Badge className="ml-2 bg-orange-100 text-orange-700">
                  {MOCK_METRICS.incompleteAssessments}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="missing_documentation">
                <FileX className="w-4 h-4 mr-2" />
                Missing Documentation
                <Badge className="ml-2 bg-yellow-100 text-yellow-700">
                  {MOCK_METRICS.missingDocumentation}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Issues List */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {sortedIssues.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Compliance Issues Found
                  </h3>
                  <p className="text-sm text-gray-600">
                    {searchTerm || selectedSeverity !== 'all' || selectedType !== 'all'
                      ? 'Try adjusting your filters'
                      : 'All documentation is up to date'}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {sortedIssues.map(issue => (
                  <ComplianceIssueCard
                    key={issue.id}
                    issue={issue}
                    onOpen={() => {
                      if (issue.documentUrl) {
                        navigate(issue.documentUrl);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// METRICS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

interface ComplianceMetricsDashboardProps {
  metrics: ComplianceMetrics;
}

function ComplianceMetricsDashboard({ metrics }: ComplianceMetricsDashboardProps) {
  const TrendIcon = metrics.trend === 'improving' ? TrendingUp : TrendingDown;
  const trendColor = metrics.trend === 'improving' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="space-y-4">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-6 gap-4">
        <MetricCard
          label="Total Issues"
          value={metrics.totalIssues}
          icon={AlertCircle}
          color="gray"
        />
        <MetricCard
          label="Critical"
          value={metrics.criticalIssues}
          icon={AlertOctagon}
          color="red"
          highlight
        />
        <MetricCard
          label="High Priority"
          value={metrics.highPriorityIssues}
          icon={AlertTriangle}
          color="amber"
        />
        <MetricCard
          label="Open"
          value={metrics.openIssues}
          icon={Activity}
          color="blue"
        />
        <MetricCard
          label="Overdue"
          value={metrics.overdueIssues}
          icon={Clock}
          color="orange"
        />
        <MetricCard
          label="Resolved Today"
          value={metrics.resolvedToday}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-gray-600">Resolution Rate</Label>
            <BarChart3 className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {metrics.resolutionRate.toFixed(1)}%
            </div>
            <div className={cn('flex items-center text-sm', trendColor)}>
              <TrendIcon className="w-4 h-4 mr-1" />
              {metrics.trendPercentage}%
            </div>
          </div>
          <Progress value={metrics.resolutionRate} className="mt-2" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-gray-600">Avg Resolution Time</Label>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metrics.averageResolutionTime.toFixed(1)} hrs
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Target: &lt; 24 hours
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm text-gray-600">Compliance Status</Label>
            <Shield className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            {metrics.criticalIssues === 0 ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="text-lg font-semibold text-green-700">Good</span>
              </>
            ) : metrics.criticalIssues <= 2 ? (
              <>
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <span className="text-lg font-semibold text-amber-700">Needs Attention</span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-6 h-6 text-red-600" />
                <span className="text-lg font-semibold text-red-700">Critical</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {metrics.criticalIssues} critical issues require immediate action
          </div>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  highlight?: boolean;
}

function MetricCard({ label, value, icon: Icon, color, highlight }: MetricCardProps) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    orange: 'bg-orange-100 text-orange-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
  };

  return (
    <Card className={cn('p-4', highlight && 'ring-2 ring-red-200')}>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs text-gray-600">{label}</Label>
        <div className={cn('p-2 rounded-lg', colorClasses[color as keyof typeof colorClasses])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE ISSUE CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ComplianceIssueCardProps {
  issue: ComplianceIssue;
  onOpen: () => void;
}

function ComplianceIssueCard({ issue, onOpen }: ComplianceIssueCardProps) {
  const severityConfig = {
    critical: {
      color: 'bg-red-100 text-red-700 border-red-300',
      icon: AlertOctagon,
      iconColor: 'text-red-600',
    },
    high: {
      color: 'bg-amber-100 text-amber-700 border-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    medium: {
      color: 'bg-orange-100 text-orange-700 border-orange-300',
      icon: AlertCircle,
      iconColor: 'text-orange-600',
    },
    low: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
    },
  };

  const typeConfig = {
    missing_documentation: {
      label: 'Missing Documentation',
      icon: FileX,
      color: 'bg-yellow-100 text-yellow-700',
    },
    unsigned_order: {
      label: 'Unsigned Order',
      icon: PenOff,
      color: 'bg-red-100 text-red-700',
    },
    incomplete_assessment: {
      label: 'Incomplete Assessment',
      icon: ClipboardX,
      color: 'bg-orange-100 text-orange-700',
    },
    overdue_visit_documentation: {
      label: 'Overdue Visit',
      icon: Clock,
      color: 'bg-amber-100 text-amber-700',
    },
  };

  const statusConfig = {
    open: { label: 'Open', color: 'bg-red-100 text-red-700 border-red-300' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-300' },
    dismissed: { label: 'Dismissed', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  };

  const severityInfo = severityConfig[issue.severity];
  const typeInfo = typeConfig[issue.type];
  const statusInfo = statusConfig[issue.status];
  
  const SeverityIcon = severityInfo.icon;
  const TypeIcon = typeInfo.icon;

  return (
    <Card className={cn(
      'p-4 hover:shadow-lg transition-shadow',
      issue.severity === 'critical' && 'ring-2 ring-red-200',
      issue.status === 'resolved' && 'opacity-60'
    )}>
      <div className="flex items-start gap-4">
        {/* Severity Icon */}
        <div className={cn('p-3 rounded-lg', severityInfo.color)}>
          <SeverityIcon className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {issue.title}
                </h3>
                {issue.overdueBy && issue.overdueBy > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {issue.overdueBy} days overdue
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{issue.patientName}</span>
                <span>•</span>
                <span>{issue.patientMRN}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={cn('border', severityInfo.color)}>
                {issue.severity.toUpperCase()}
              </Badge>
              <Badge className={cn('border', statusInfo.color)}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-3">
            {issue.description}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
            <div>
              <Label className="text-xs text-gray-500">Type</Label>
              <div className="flex items-center gap-1 mt-1">
                <TypeIcon className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{typeInfo.label}</span>
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-gray-500">Document</Label>
              <div className="flex items-center gap-1 mt-1">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{issue.documentType || 'N/A'}</span>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Assigned To</Label>
              <div className="mt-1 font-medium truncate">
                {issue.assignedTo || 'Unassigned'}
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Due Date</Label>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="font-medium">
                  {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Regulatory Impact */}
          {issue.regulatoryRequirement && (
            <Alert className="mb-3 border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-900">
                <strong>Regulatory:</strong> {issue.regulatoryRequirement}
              </AlertDescription>
            </Alert>
          )}

          {/* Last Action */}
          {issue.lastAction && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <Activity className="w-3 h-3" />
              <span>
                Last action: {issue.lastAction} 
                {issue.lastActionDate && (
                  <> • {new Date(issue.lastActionDate).toLocaleString()}</>
                )}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={onOpen}
              disabled={!issue.documentUrl}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Document
            </Button>
            
            {issue.status === 'open' && (
              <>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Assign
                </Button>
                <Button variant="outline" size="sm">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Mark in Progress
                </Button>
              </>
            )}

            {issue.status === 'in_progress' && (
              <Button variant="outline" size="sm" className="text-green-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Resolved
              </Button>
            )}

            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
