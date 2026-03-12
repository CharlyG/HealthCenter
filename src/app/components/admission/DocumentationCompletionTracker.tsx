/**
 * Documentation Completion Tracker
 * 
 * Tracks and displays the completion status of all required documentation
 * for an admission episode. Shows what's complete, pending, or missing,
 * with special emphasis on documentation required for billing.
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  FileText,
  FileSignature,
  ClipboardCheck,
  Pill,
  Activity,
  DollarSign,
  ArrowRight,
  Download,
  Eye,
  Edit,
  AlertTriangle,
  Calendar,
  User,
  Stethoscope,
  TrendingUp,
  Shield,
  Heart,
} from 'lucide-react';

export type DocumentStatus = 'completed' | 'pending' | 'missing' | 'not_required';

export interface DocumentationItem {
  id: string;
  category: DocumentationCategory;
  title: string;
  description: string;
  status: DocumentStatus;
  requiredForBilling: boolean;
  dueDate?: string;
  completedDate?: string;
  completedBy?: {
    name: string;
    role: string;
  };
  relatedVisitId?: string;
  warningMessage?: string;
}

export type DocumentationCategory =
  | 'visit_notes'
  | 'plan_of_care'
  | 'orders'
  | 'assessments'
  | 'authorizations'
  | 'signatures'
  | 'billing_documents';

interface DocumentationCompletionTrackerProps {
  admissionId: string;
  documents: DocumentationItem[];
  onDocumentClick?: (document: DocumentationItem) => void;
  showBillingBlockersOnly?: boolean;
}

const categoryConfig: Record<
  DocumentationCategory,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
  }
> = {
  visit_notes: {
    label: 'Visit Notes',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  plan_of_care: {
    label: 'Plan of Care',
    icon: ClipboardCheck,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  orders: {
    label: 'Orders',
    icon: Pill,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  assessments: {
    label: 'Assessments',
    icon: Activity,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  authorizations: {
    label: 'Authorizations',
    icon: Shield,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  signatures: {
    label: 'Signatures',
    icon: FileSignature,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  billing_documents: {
    label: 'Billing Documents',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
};

export function DocumentationCompletionTracker({
  admissionId,
  documents,
  onDocumentClick,
  showBillingBlockersOnly = false,
}: DocumentationCompletionTrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<DocumentationCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');

  // Calculate overall statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const completed = documents.filter((d) => d.status === 'completed').length;
    const pending = documents.filter((d) => d.status === 'pending').length;
    const missing = documents.filter((d) => d.status === 'missing').length;
    const billingBlockers = documents.filter(
      (d) => d.requiredForBilling && d.status !== 'completed'
    ).length;

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      missing,
      billingBlockers,
      completionPercentage,
    };
  }, [documents]);

  // Count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<DocumentationCategory, number> = {
      visit_notes: 0,
      plan_of_care: 0,
      orders: 0,
      assessments: 0,
      authorizations: 0,
      signatures: 0,
      billing_documents: 0,
    };

    documents.forEach((doc) => {
      counts[doc.category]++;
    });

    return counts;
  }, [documents]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (showBillingBlockersOnly) {
      filtered = filtered.filter((d) => d.requiredForBilling && d.status !== 'completed');
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((d) => d.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((d) => d.status === selectedStatus);
    }

    return filtered;
  }, [documents, selectedCategory, selectedStatus, showBillingBlockersOnly]);

  // Group by category
  const groupedDocuments = useMemo(() => {
    const grouped: Record<DocumentationCategory, DocumentationItem[]> = {
      visit_notes: [],
      plan_of_care: [],
      orders: [],
      assessments: [],
      authorizations: [],
      signatures: [],
      billing_documents: [],
    };

    filteredDocuments.forEach((doc) => {
      grouped[doc.category].push(doc);
    });

    return grouped;
  }, [filteredDocuments]);

  return (
    <div className="space-y-4">
      {/* Header with Overall Progress */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-6 text-blue-600" />
            Documentation Completion Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
              <span className="text-2xl font-bold text-blue-700">
                {stats.completionPercentage}%
              </span>
            </div>
            <Progress value={stats.completionPercentage} className="h-3" />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
              <span>
                {stats.completed} of {stats.total} items completed
              </span>
              {stats.billingBlockers > 0 && (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  {stats.billingBlockers} billing blockers
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 border border-green-200 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="size-4 text-green-600" />
                <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
              </div>
              <p className="text-xs text-gray-600">Completed</p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-yellow-200 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="size-4 text-yellow-600" />
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <p className="text-xs text-gray-600">Pending</p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-red-200 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertCircle className="size-4 text-red-600" />
                <p className="text-2xl font-bold text-red-700">{stats.missing}</p>
              </div>
              <p className="text-xs text-gray-600">Missing</p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-blue-200 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="size-4 text-blue-600" />
                <p className="text-2xl font-bold text-blue-700">{stats.billingBlockers}</p>
              </div>
              <p className="text-xs text-gray-600">Billing Blockers</p>
            </div>
          </div>

          {/* Billing Alert */}
          {stats.billingBlockers > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900 text-sm">
                  {stats.billingBlockers} item{stats.billingBlockers > 1 ? 's' : ''} blocking
                  billing
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Complete these items to enable claim submission
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => setSelectedStatus('missing')}
              >
                View Items
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Category Filter */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Filter by Category</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="text-xs"
              >
                All Categories
                <Badge variant="secondary" className="ml-2 text-[10px]">
                  {documents.length}
                </Badge>
              </Button>
              {(Object.keys(categoryConfig) as DocumentationCategory[])
                .filter((cat) => categoryCounts[cat] > 0)
                .map((category) => {
                  const config = categoryConfig[category];
                  const Icon = config.icon;
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      <Icon className="size-3 mr-1.5" />
                      {config.label}
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        {categoryCounts[category]}
                      </Badge>
                    </Button>
                  );
                })}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Filter by Status</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
                className="text-xs"
              >
                All Status
              </Button>
              <Button
                variant={selectedStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('completed')}
                className="text-xs"
              >
                <CheckCircle2 className="size-3 mr-1.5 text-green-600" />
                Completed
              </Button>
              <Button
                variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('pending')}
                className="text-xs"
              >
                <Clock className="size-3 mr-1.5 text-yellow-600" />
                Pending
              </Button>
              <Button
                variant={selectedStatus === 'missing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('missing')}
                className="text-xs"
              >
                <AlertCircle className="size-3 mr-1.5 text-red-600" />
                Missing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Items by Category */}
      <div className="space-y-4">
        {(Object.keys(categoryConfig) as DocumentationCategory[])
          .filter((category) => groupedDocuments[category].length > 0)
          .map((category) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            const items = groupedDocuments[category];

            const categoryCompleted = items.filter((i) => i.status === 'completed').length;
            const categoryTotal = items.length;
            const categoryProgress = Math.round((categoryCompleted / categoryTotal) * 100);

            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className={`size-8 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`size-4 ${config.color}`} />
                      </div>
                      {config.label}
                      <Badge variant="outline" className="text-xs">
                        {categoryCompleted}/{categoryTotal}
                      </Badge>
                    </CardTitle>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{categoryProgress}%</p>
                      <Progress value={categoryProgress} className="h-1.5 w-20" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((item) => (
                    <DocumentationItemCard
                      key={item.id}
                      item={item}
                      onClick={onDocumentClick}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <CheckCircle2 className="size-12 text-green-600 mx-auto" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  No documentation items match your filters
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Try adjusting your filter criteria
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface DocumentationItemCardProps {
  item: DocumentationItem;
  onClick?: (item: DocumentationItem) => void;
}

function DocumentationItemCard({ item, onClick }: DocumentationItemCardProps) {
  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      label: 'Completed',
      badgeClass: 'bg-green-100 text-green-800',
    },
    pending: {
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'Pending',
      badgeClass: 'bg-yellow-100 text-yellow-800',
    },
    missing: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      label: 'Missing',
      badgeClass: 'bg-red-100 text-red-800',
    },
    not_required: {
      icon: Circle,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      label: 'Not Required',
      badgeClass: 'bg-gray-100 text-gray-800',
    },
  };

  const config = statusConfig[item.status];
  const StatusIcon = config.icon;

  return (
    <div
      className={`border-2 ${config.borderColor} ${config.bgColor} rounded-lg p-3 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${item.requiredForBilling && item.status !== 'completed' ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}
      onClick={() => onClick?.(item)}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <StatusIcon className={`size-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
                  {config.label}
                </Badge>
                {item.requiredForBilling && (
                  <Badge className="text-[10px] bg-blue-600 text-white">
                    <DollarSign className="size-2.5 mr-1" />
                    Required for Billing
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
            {item.completedDate && item.completedBy && (
              <>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-green-600" />
                  <span>
                    Completed {new Date(item.completedDate).toLocaleDateString()} by{' '}
                    {item.completedBy.name}
                  </span>
                </div>
              </>
            )}
            {item.dueDate && item.status !== 'completed' && (
              <div className="flex items-center gap-1">
                <Calendar className="size-3" />
                <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {item.relatedVisitId && (
              <div className="flex items-center gap-1">
                <Stethoscope className="size-3" />
                <span>Visit #{item.relatedVisitId}</span>
              </div>
            )}
          </div>

          {/* Warning Message */}
          {item.warningMessage && item.status !== 'completed' && (
            <div className="bg-red-100 border border-red-300 rounded p-2 flex items-start gap-2">
              <AlertTriangle className="size-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">{item.warningMessage}</p>
            </div>
          )}

          {/* Actions */}
          {onClick && (
            <div className="pt-1">
              <Button variant="outline" size="sm" className="h-7 text-xs">
                {item.status === 'completed' ? (
                  <>
                    <Eye className="size-3 mr-1.5" />
                    View Document
                  </>
                ) : (
                  <>
                    <Edit className="size-3 mr-1.5" />
                    Complete Now
                  </>
                )}
                <ArrowRight className="size-3 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mock data generator
export function generateMockDocumentationItems(admissionId: string): DocumentationItem[] {
  return [
    // Visit Notes
    {
      id: 'doc-001',
      category: 'visit_notes',
      title: 'SOC Visit Note',
      description: 'Start of Care comprehensive visit note',
      status: 'completed',
      requiredForBilling: true,
      completedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
      relatedVisitId: 'VST-001',
    },
    {
      id: 'doc-002',
      category: 'visit_notes',
      title: 'Visit Note #2',
      description: 'Skilled nursing follow-up visit',
      status: 'completed',
      requiredForBilling: true,
      completedDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
      relatedVisitId: 'VST-002',
    },
    {
      id: 'doc-003',
      category: 'visit_notes',
      title: 'Visit Note #3',
      description: 'Physical therapy visit note',
      status: 'pending',
      requiredForBilling: true,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      relatedVisitId: 'VST-003',
      warningMessage: 'Visit note overdue - complete within 24 hours to avoid billing delay',
    },
    {
      id: 'doc-004',
      category: 'visit_notes',
      title: 'Visit Note #4',
      description: 'Recent skilled nursing visit',
      status: 'missing',
      requiredForBilling: true,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      relatedVisitId: 'VST-004',
      warningMessage: 'Critical: This visit note must be completed before claim submission',
    },

    // Plan of Care
    {
      id: 'doc-005',
      category: 'plan_of_care',
      title: 'Initial Plan of Care',
      description: 'Physician-signed plan of care with all disciplines',
      status: 'completed',
      requiredForBilling: true,
      completedDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: { name: 'Dr. James Anderson', role: 'Physician' },
    },
    {
      id: 'doc-006',
      category: 'plan_of_care',
      title: 'Plan of Care Update',
      description: '30-day plan of care review and update',
      status: 'pending',
      requiredForBilling: false,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // Orders
    {
      id: 'doc-007',
      category: 'orders',
      title: 'Verbal Orders - Initial',
      description: 'Initial verbal orders for skilled nursing and PT',
      status: 'completed',
      requiredForBilling: true,
      completedDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: { name: 'Dr. James Anderson', role: 'Physician' },
    },
    {
      id: 'doc-008',
      category: 'orders',
      title: 'Physician Signature on Orders',
      description: 'Signed certification of verbal orders received',
      status: 'missing',
      requiredForBilling: true,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      warningMessage: 'Physician signature required for billing - deadline approaching',
    },

    // Assessments
    {
      id: 'doc-009',
      category: 'assessments',
      title: 'OASIS-E Start of Care',
      description: 'Complete OASIS-E SOC assessment',
      status: 'completed',
      requiredForBilling: true,
      completedDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    },
    {
      id: 'doc-010',
      category: 'assessments',
      title: 'HOPE Assessment',
      description: 'Health Outcome and Patient Evaluation assessment',
      status: 'completed',
      requiredForBilling: false,
      completedDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: { name: 'Jennifer Lee, RN', role: 'Clinical Nurse' },
    },

    // Authorizations
    {
      id: 'doc-011',
      category: 'authorizations',
      title: 'Medicare Authorization',
      description: 'Authorization for 60 visits approved',
      status: 'completed',
      requiredForBilling: true,
      completedDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: { name: 'System', role: 'Automated' },
    },

    // Signatures
    {
      id: 'doc-012',
      category: 'signatures',
      title: 'Patient Rights & Responsibilities',
      description: 'Patient signature acknowledging receipt',
      status: 'completed',
      requiredForBilling: true,
      completedDate: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: { name: 'Mary Johnson', role: 'Patient' },
    },
    {
      id: 'doc-013',
      category: 'signatures',
      title: 'Consent for Treatment',
      description: 'Patient consent for home health services',
      status: 'completed',
      requiredForBilling: true,
      completedDate: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: { name: 'Mary Johnson', role: 'Patient' },
    },
    {
      id: 'doc-014',
      category: 'signatures',
      title: 'Physician Certification',
      description: 'Face-to-face certification signature',
      status: 'pending',
      requiredForBilling: true,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      warningMessage: 'Required for claim submission - obtain within 48 hours',
    },

    // Billing Documents
    {
      id: 'doc-015',
      category: 'billing_documents',
      title: 'Benefit Period Documentation',
      description: 'Documentation of eligible benefit period',
      status: 'completed',
      requiredForBilling: true,
      completedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: { name: 'Sarah Martinez', role: 'Intake Coordinator' },
    },
    {
      id: 'doc-016',
      category: 'billing_documents',
      title: 'Pre-Billing Review',
      description: 'Quality review of all billing documentation',
      status: 'missing',
      requiredForBilling: true,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      warningMessage: 'Final review required before claim can be submitted',
    },
  ];
}
