/**
 * Admission Queues Workspace
 * 
 * Centralized workspace for managing admission-level queues:
 * - Admissions missing required fields
 * - Admissions missing authorization
 * - Admissions missing physician signature
 * - Admissions missing documentation
 * - Admissions ready for billing
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  AdmissionQueueItem,
  AdmissionQueueList,
  type AdmissionQueueType,
  type AdmissionQueuePriority,
} from '../components/workspace/AdmissionQueueItem';
import {
  FileText,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  DollarSign,
  RefreshCw,
  Download,
  Filter,
  Loader2,
} from 'lucide-react';

interface AdmissionQueueData {
  admissionId: string;
  patientName: string;
  patientMRN: string;
  admissionStartDate: string;
  primaryPayer: string;
  assignedCoordinator?: string;
  queueType: AdmissionQueueType;
  currentIssue: string;
  issueDetails?: string[];
  priority: AdmissionQueuePriority;
  daysOverdue?: number;
}

// Mock data generator
function generateMockQueueData(): Record<AdmissionQueueType, AdmissionQueueData[]> {
  const baseDate = new Date();
  
  return {
    missing_fields: [
      {
        admissionId: 'ADM-2026-001',
        patientName: 'Johnson, Mary',
        patientMRN: 'MRN-001234',
        admissionStartDate: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Medicare Part A',
        assignedCoordinator: 'Sarah Martinez',
        queueType: 'missing_fields',
        currentIssue: 'Missing emergency contact and medication list',
        issueDetails: [
          'Emergency contact information required',
          'Current medication list not provided',
          'Advance directives not on file',
        ],
        priority: 'high',
        daysOverdue: 5,
      },
      {
        admissionId: 'ADM-2026-007',
        patientName: 'Williams, Robert',
        patientMRN: 'MRN-007891',
        admissionStartDate: new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Aetna',
        assignedCoordinator: 'Jennifer Lee',
        queueType: 'missing_fields',
        currentIssue: 'Incomplete insurance information',
        issueDetails: [
          'Secondary insurance details missing',
          'Policy effective dates not confirmed',
        ],
        priority: 'medium',
        daysOverdue: 3,
      },
      {
        admissionId: 'ADM-2026-012',
        patientName: 'Davis, Linda',
        patientMRN: 'MRN-012345',
        admissionStartDate: new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Blue Cross Blue Shield',
        assignedCoordinator: 'Sarah Martinez',
        queueType: 'missing_fields',
        currentIssue: 'Missing referral source details',
        issueDetails: [
          'Referring physician contact not provided',
          'Hospital discharge date missing',
        ],
        priority: 'low',
        daysOverdue: 2,
      },
    ],
    missing_authorization: [
      {
        admissionId: 'ADM-2026-003',
        patientName: 'Brown, Patricia',
        patientMRN: 'MRN-003456',
        admissionStartDate: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'UnitedHealthcare',
        assignedCoordinator: 'Michael Chen',
        queueType: 'missing_authorization',
        currentIssue: 'Authorization pending from payer',
        issueDetails: [
          'Initial authorization request submitted 7 days ago',
          'Follow-up call scheduled for today',
          'May require peer-to-peer review',
        ],
        priority: 'critical',
        daysOverdue: 7,
      },
      {
        admissionId: 'ADM-2026-009',
        patientName: 'Martinez, Carlos',
        patientMRN: 'MRN-009123',
        admissionStartDate: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Medicare Part A',
        assignedCoordinator: 'Jennifer Lee',
        queueType: 'missing_authorization',
        currentIssue: 'Additional documentation requested by payer',
        issueDetails: [
          'Payer requires updated physician orders',
          'Face-to-face encounter documentation needed',
        ],
        priority: 'high',
        daysOverdue: 4,
      },
    ],
    missing_signature: [
      {
        admissionId: 'ADM-2026-004',
        patientName: 'Wilson, James',
        patientMRN: 'MRN-004567',
        admissionStartDate: new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Humana',
        assignedCoordinator: 'Sarah Martinez',
        queueType: 'missing_signature',
        currentIssue: 'Plan of Care awaiting physician signature',
        issueDetails: [
          'POC sent to Dr. Anderson 10 days ago',
          'Follow-up reminder sent',
          'Recertification deadline approaching',
        ],
        priority: 'critical',
        daysOverdue: 10,
      },
      {
        admissionId: 'ADM-2026-011',
        patientName: 'Taylor, Susan',
        patientMRN: 'MRN-011234',
        admissionStartDate: new Date(baseDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Medicare Part A',
        assignedCoordinator: 'Michael Chen',
        queueType: 'missing_signature',
        currentIssue: 'Verbal orders pending physician co-signature',
        issueDetails: [
          '3 verbal orders require physician signature',
          'Dr. Williams notified via secure messaging',
        ],
        priority: 'high',
        daysOverdue: 6,
      },
    ],
    missing_documentation: [
      {
        admissionId: 'ADM-2026-005',
        patientName: 'Anderson, Betty',
        patientMRN: 'MRN-005678',
        admissionStartDate: new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Cigna',
        assignedCoordinator: 'Jennifer Lee',
        queueType: 'missing_documentation',
        currentIssue: 'OASIS assessment not completed',
        issueDetails: [
          'Start of Care OASIS due within 5 days',
          'RN clinician assigned: Sarah Johnson',
          'Patient visit scheduled for tomorrow',
        ],
        priority: 'high',
        daysOverdue: 8,
      },
      {
        admissionId: 'ADM-2026-008',
        patientName: 'Thompson, George',
        patientMRN: 'MRN-008912',
        admissionStartDate: new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Medicare Part A',
        assignedCoordinator: 'Sarah Martinez',
        queueType: 'missing_documentation',
        currentIssue: 'Missing hospital discharge summary',
        issueDetails: [
          'Discharge summary not received from referring hospital',
          'Fax request sent to hospital records dept',
        ],
        priority: 'medium',
        daysOverdue: 4,
      },
      {
        admissionId: 'ADM-2026-013',
        patientName: 'Moore, Helen',
        patientMRN: 'MRN-013456',
        admissionStartDate: new Date(baseDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Blue Cross Blue Shield',
        assignedCoordinator: 'Michael Chen',
        queueType: 'missing_documentation',
        currentIssue: 'Face-to-face encounter form incomplete',
        issueDetails: [
          'Physician signature required on F2F form',
          'Form sent to Dr. Lee for completion',
        ],
        priority: 'medium',
        daysOverdue: 1,
      },
    ],
    ready_for_billing: [
      {
        admissionId: 'ADM-2026-002',
        patientName: 'Garcia, Maria',
        patientMRN: 'MRN-002345',
        admissionStartDate: new Date(baseDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Medicare Part A',
        assignedCoordinator: 'Sarah Martinez',
        queueType: 'ready_for_billing',
        currentIssue: 'All documentation complete - Ready for claim submission',
        issueDetails: [
          '12 visits completed and documented',
          'All signatures obtained',
          'OASIS locked and transmitted',
        ],
        priority: 'medium',
      },
      {
        admissionId: 'ADM-2026-006',
        patientName: 'Lee, Richard',
        patientMRN: 'MRN-006789',
        admissionStartDate: new Date(baseDate.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Aetna',
        assignedCoordinator: 'Jennifer Lee',
        queueType: 'ready_for_billing',
        currentIssue: 'Statement period complete - Generate claim',
        issueDetails: [
          'Statement period: 02/15 - 03/14',
          '15 billable visits',
          'Authorization verified',
        ],
        priority: 'medium',
      },
      {
        admissionId: 'ADM-2026-010',
        patientName: 'Jackson, Dorothy',
        patientMRN: 'MRN-010123',
        admissionStartDate: new Date(baseDate.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        primaryPayer: 'Medicare Part A',
        assignedCoordinator: 'Michael Chen',
        queueType: 'ready_for_billing',
        currentIssue: 'Recertification period ready for billing',
        issueDetails: [
          'Recert OASIS completed and locked',
          'Physician signatures obtained',
          '18 visits in billing period',
        ],
        priority: 'low',
      },
    ],
    pending_review: [],
    incomplete: [],
  };
}

export default function AdmissionQueuesWorkspace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [queues, setQueues] = useState<Record<AdmissionQueueType, AdmissionQueueData[]>>({
    missing_fields: [],
    missing_authorization: [],
    missing_signature: [],
    missing_documentation: [],
    ready_for_billing: [],
    pending_review: [],
    incomplete: [],
  });
  const [activeTab, setActiveTab] = useState<AdmissionQueueType>('missing_fields');

  useEffect(() => {
    loadQueues();
  }, []);

  const loadQueues = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      // const result = await admissionGateway.getQueues();
      
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData = generateMockQueueData();
      setQueues(mockData);
    } catch (err) {
      console.error('[AdmissionQueuesWorkspace] Error loading queues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (admissionId: string) => {
    navigate(`/admissions/${admissionId}`);
  };

  const handleResolve = (admissionId: string) => {
    console.log('Resolve admission:', admissionId);
    // TODO: Implement resolve logic
  };

  // Calculate totals
  const totalItems = Object.values(queues).reduce((sum, queue) => sum + queue.length, 0);
  const criticalItems = Object.values(queues)
    .flat()
    .filter(item => item.priority === 'critical').length;

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="size-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading admission queues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admission Queues</h1>
            <p className="text-gray-600 mt-1">
              Manage admissions requiring attention across all workflow stages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadQueues}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="size-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
              <p className="text-xs text-gray-600 mt-1">Total Items</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{queues.missing_fields.length}</p>
              <p className="text-xs text-amber-700 mt-1">Missing Fields</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{queues.missing_authorization.length}</p>
              <p className="text-xs text-red-700 mt-1">Missing Auth</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-700">{queues.missing_signature.length}</p>
              <p className="text-xs text-purple-700 mt-1">Missing Signature</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{queues.ready_for_billing.length}</p>
              <p className="text-xs text-green-700 mt-1">Ready for Billing</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alert */}
        {criticalItems > 0 && (
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="size-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">
                  {criticalItems} Critical {criticalItems === 1 ? 'Item' : 'Items'} Requiring Immediate Attention
                </p>
                <p className="text-sm text-red-700 mt-0.5">
                  These admissions have critical issues that may impact patient care or compliance
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => {
                  // Filter to show only critical items
                  const firstCriticalType = Object.entries(queues).find(([_, items]) =>
                    items.some(item => item.priority === 'critical')
                  )?.[0] as AdmissionQueueType;
                  if (firstCriticalType) setActiveTab(firstCriticalType);
                }}
              >
                View Critical Items
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Queue Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdmissionQueueType)}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="missing_fields" className="text-xs">
              <FileText className="size-4 mr-2" />
              Missing Fields
              {queues.missing_fields.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px] h-5">
                  {queues.missing_fields.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="missing_authorization" className="text-xs">
              <ShieldCheck className="size-4 mr-2" />
              Missing Auth
              {queues.missing_authorization.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px] h-5">
                  {queues.missing_authorization.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="missing_signature" className="text-xs">
              <FileCheck className="size-4 mr-2" />
              Missing Signature
              {queues.missing_signature.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px] h-5">
                  {queues.missing_signature.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="missing_documentation" className="text-xs">
              <AlertCircle className="size-4 mr-2" />
              Missing Docs
              {queues.missing_documentation.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px] h-5">
                  {queues.missing_documentation.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ready_for_billing" className="text-xs">
              <DollarSign className="size-4 mr-2" />
              Ready for Billing
              {queues.ready_for_billing.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px] h-5">
                  {queues.ready_for_billing.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="missing_fields">
            <AdmissionQueueList
              title="Admissions Missing Required Fields"
              description="Complete all required fields to proceed with admission workflow"
              items={queues.missing_fields.map(item => ({
                ...item,
                onClick: () => handleItemClick(item.admissionId),
                onResolve: () => handleResolve(item.admissionId),
              }))}
              emptyMessage="No admissions missing required fields"
            />
          </TabsContent>

          <TabsContent value="missing_authorization">
            <AdmissionQueueList
              title="Admissions Missing Authorization"
              description="Authorization from payer required before services can begin"
              items={queues.missing_authorization.map(item => ({
                ...item,
                onClick: () => handleItemClick(item.admissionId),
                onResolve: () => handleResolve(item.admissionId),
              }))}
              emptyMessage="No admissions pending authorization"
            />
          </TabsContent>

          <TabsContent value="missing_signature">
            <AdmissionQueueList
              title="Admissions Missing Physician Signature"
              description="Physician signature required for plan of care and orders"
              items={queues.missing_signature.map(item => ({
                ...item,
                onClick: () => handleItemClick(item.admissionId),
                onResolve: () => handleResolve(item.admissionId),
              }))}
              emptyMessage="No admissions pending physician signature"
            />
          </TabsContent>

          <TabsContent value="missing_documentation">
            <AdmissionQueueList
              title="Admissions Missing Documentation"
              description="Clinical documentation required for compliance and billing"
              items={queues.missing_documentation.map(item => ({
                ...item,
                onClick: () => handleItemClick(item.admissionId),
                onResolve: () => handleResolve(item.admissionId),
              }))}
              emptyMessage="No admissions missing documentation"
            />
          </TabsContent>

          <TabsContent value="ready_for_billing">
            <AdmissionQueueList
              title="Admissions Ready for Billing"
              description="All requirements met - ready to generate and submit claims"
              items={queues.ready_for_billing.map(item => ({
                ...item,
                onClick: () => handleItemClick(item.admissionId),
                onResolve: () => handleResolve(item.admissionId),
              }))}
              emptyMessage="No admissions ready for billing"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
