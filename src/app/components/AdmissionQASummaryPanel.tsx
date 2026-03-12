/**
 * Admission QA Summary Panel Component
 * 
 * Summary panel for admission showing documents reviewed, pending review,
 * returned, and compliance status. Appears in admission dashboard and QA
 * workspace.
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Eye,
  XCircle,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Clock,
  FileText,
  Shield,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface QADocumentSummary {
  documentId: string;
  documentType: string;
  status: 'reviewed' | 'pending' | 'returned' | 'approved';
  submittedDate: string;
  reviewedDate?: string;
  priority?: 'urgent' | 'high' | 'normal';
  reviewerName?: string;
  issueCount?: number;
}

export interface ComplianceStatus {
  overall: 'compliant' | 'at-risk' | 'non-compliant';
  categories: {
    name: string;
    status: 'pass' | 'warning' | 'fail';
    details?: string;
  }[];
  score: number; // 0-100
}

export interface AdmissionQASummary {
  admissionId: string;
  patientName: string;
  documentsReviewed: number;
  documentsPending: number;
  documentsReturned: number;
  documentsApproved: number;
  complianceStatus: ComplianceStatus;
  recentDocuments: QADocumentSummary[];
  avgTurnaroundHours?: number;
  lastReviewDate?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface AdmissionQASummaryPanelProps {
  data: AdmissionQASummary;
  onViewDocuments?: (status?: 'reviewed' | 'pending' | 'returned' | 'approved') => void;
  onViewCompliance?: () => void;
  mode?: 'full' | 'compact' | 'mini';
}

export default function AdmissionQASummaryPanel({
  data,
  onViewDocuments,
  onViewCompliance,
  mode = 'full',
}: AdmissionQASummaryPanelProps) {
  if (mode === 'mini') {
    return <MiniSummary data={data} onViewDocuments={onViewDocuments} />;
  }

  if (mode === 'compact') {
    return <CompactSummary data={data} onViewDocuments={onViewDocuments} />;
  }

  const totalDocuments =
    data.documentsReviewed + data.documentsPending + data.documentsReturned + data.documentsApproved;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">QA Documentation Summary</h3>
            <p className="text-sm text-gray-600 mt-1">
              {data.patientName} • {data.admissionId}
            </p>
          </div>

          <Badge
            variant="outline"
            className={cn(
              'text-sm px-3 py-1',
              data.complianceStatus.overall === 'compliant'
                ? 'bg-green-100 text-green-700 border-green-300'
                : data.complianceStatus.overall === 'at-risk'
                ? 'bg-amber-100 text-amber-700 border-amber-300'
                : 'bg-red-100 text-red-700 border-red-300'
            )}
          >
            <Shield className="w-4 h-4 mr-1" />
            {data.complianceStatus.overall === 'compliant'
              ? 'Compliant'
              : data.complianceStatus.overall === 'at-risk'
              ? 'At Risk'
              : 'Non-Compliant'}
          </Badge>
        </div>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <QAMetricCard
          label="Reviewed"
          value={data.documentsReviewed}
          icon={Eye}
          color="blue"
          onClick={() => onViewDocuments?.('reviewed')}
        />
        <QAMetricCard
          label="Pending Review"
          value={data.documentsPending}
          icon={Clock}
          color="amber"
          onClick={() => onViewDocuments?.('pending')}
        />
        <QAMetricCard
          label="Returned"
          value={data.documentsReturned}
          icon={XCircle}
          color="red"
          onClick={() => onViewDocuments?.('returned')}
        />
        <QAMetricCard
          label="Approved"
          value={data.documentsApproved}
          icon={CheckCircle}
          color="green"
          onClick={() => onViewDocuments?.('approved')}
        />
      </div>

      {/* Compliance Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compliance Status
          </h4>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm text-gray-600">Compliance Score</div>
              <div
                className={cn(
                  'text-2xl font-bold',
                  data.complianceStatus.score >= 90
                    ? 'text-green-700'
                    : data.complianceStatus.score >= 70
                    ? 'text-amber-700'
                    : 'text-red-700'
                )}
              >
                {data.complianceStatus.score}%
              </div>
            </div>
            {onViewCompliance && (
              <Button variant="outline" size="sm" onClick={onViewCompliance}>
                View Details
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {data.complianceStatus.categories.map((category, index) => (
            <ComplianceCategoryRow key={index} category={category} />
          ))}
        </div>
      </Card>

      {/* Recent Documents */}
      {data.recentDocuments.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent QA Activity
            </h4>
            {data.lastReviewDate && (
              <span className="text-xs text-gray-600">
                Last review: {new Date(data.lastReviewDate).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {data.recentDocuments.slice(0, 5).map((doc) => (
              <DocumentRow key={doc.documentId} document={doc} />
            ))}
          </div>

          {data.recentDocuments.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDocuments?.()}
              className="w-full mt-2"
            >
              View All Documents
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </Card>
      )}

      {/* Stats Row */}
      {data.avgTurnaroundHours && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700">Average QA Turnaround Time</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{data.avgTurnaroundHours}h</div>
              <div className="text-xs text-gray-600">
                {totalDocuments} document{totalDocuments !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QA METRIC CARD
// ═══════════════════════════════════════════════════════════════════════════

function QAMetricCard({
  label,
  value,
  icon: Icon,
  color,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  };

  const colors = colorClasses[color as keyof typeof colorClasses];

  return (
    <Card
      className={cn(
        'p-4 transition-all',
        colors.border,
        onClick && 'cursor-pointer hover:shadow-md'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-5 h-5', colors.text)} />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {onClick && <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE CATEGORY ROW
// ═══════════════════════════════════════════════════════════════════════════

function ComplianceCategoryRow({
  category,
}: {
  category: { name: string; status: 'pass' | 'warning' | 'fail'; details?: string };
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {category.status === 'pass' ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : category.status === 'warning' ? (
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
        <div>
          <div className="font-medium text-gray-900">{category.name}</div>
          {category.details && <div className="text-xs text-gray-600">{category.details}</div>}
        </div>
      </div>

      <Badge
        variant="outline"
        className={cn(
          'text-xs',
          category.status === 'pass'
            ? 'bg-green-100 text-green-700 border-green-300'
            : category.status === 'warning'
            ? 'bg-amber-100 text-amber-700 border-amber-300'
            : 'bg-red-100 text-red-700 border-red-300'
        )}
      >
        {category.status === 'pass' ? 'Pass' : category.status === 'warning' ? 'Warning' : 'Fail'}
      </Badge>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT ROW
// ═══════════════════════════════════════════════════════════════════════════

function DocumentRow({ document }: { document: QADocumentSummary }) {
  const statusConfig = {
    reviewed: { icon: Eye, color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Reviewed' },
    pending: {
      icon: Clock,
      color: 'bg-amber-100 text-amber-700 border-amber-300',
      label: 'Pending',
    },
    returned: { icon: XCircle, color: 'bg-red-100 text-red-700 border-red-300', label: 'Returned' },
    approved: {
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 border-green-300',
      label: 'Approved',
    },
  };

  const config = statusConfig[document.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.color)}>
          <StatusIcon className="w-4 h-4" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{document.documentType}</span>
            {document.priority && document.priority !== 'normal' && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  document.priority === 'urgent'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-orange-100 text-orange-700 border-orange-300'
                )}
              >
                {document.priority}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>Submitted: {new Date(document.submittedDate).toLocaleDateString()}</span>
            {document.reviewedDate && (
              <>
                <span>•</span>
                <span>Reviewed: {new Date(document.reviewedDate).toLocaleDateString()}</span>
              </>
            )}
            {document.reviewerName && (
              <>
                <span>•</span>
                <span>{document.reviewerName}</span>
              </>
            )}
            {document.issueCount && document.issueCount > 0 && (
              <>
                <span>•</span>
                <span className="text-red-700 font-medium">
                  {document.issueCount} issue{document.issueCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <Badge variant="outline" className={cn('text-xs', config.color)}>
        {config.label}
      </Badge>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

function CompactSummary({
  data,
  onViewDocuments,
}: {
  data: AdmissionQASummary;
  onViewDocuments?: (status?: any) => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-sm">QA Summary</h4>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            data.complianceStatus.overall === 'compliant'
              ? 'bg-green-100 text-green-700 border-green-300'
              : data.complianceStatus.overall === 'at-risk'
              ? 'bg-amber-100 text-amber-700 border-amber-300'
              : 'bg-red-100 text-red-700 border-red-300'
          )}
        >
          {data.complianceStatus.score}% Compliant
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => onViewDocuments?.('pending')}
          className="p-2 bg-amber-50 border border-amber-200 rounded text-left hover:bg-amber-100 transition-colors"
        >
          <div className="text-xs text-amber-700 mb-1">Pending</div>
          <div className="text-xl font-bold text-amber-900">{data.documentsPending}</div>
        </button>

        <button
          onClick={() => onViewDocuments?.('returned')}
          className="p-2 bg-red-50 border border-red-200 rounded text-left hover:bg-red-100 transition-colors"
        >
          <div className="text-xs text-red-700 mb-1">Returned</div>
          <div className="text-xl font-bold text-red-900">{data.documentsReturned}</div>
        </button>

        <button
          onClick={() => onViewDocuments?.('reviewed')}
          className="p-2 bg-blue-50 border border-blue-200 rounded text-left hover:bg-blue-100 transition-colors"
        >
          <div className="text-xs text-blue-700 mb-1">Reviewed</div>
          <div className="text-xl font-bold text-blue-900">{data.documentsReviewed}</div>
        </button>

        <button
          onClick={() => onViewDocuments?.('approved')}
          className="p-2 bg-green-50 border border-green-200 rounded text-left hover:bg-green-100 transition-colors"
        >
          <div className="text-xs text-green-700 mb-1">Approved</div>
          <div className="text-xl font-bold text-green-900">{data.documentsApproved}</div>
        </button>
      </div>

      {onViewDocuments && (
        <Button variant="outline" size="sm" onClick={() => onViewDocuments()} className="w-full">
          View All Documents
          <ChevronRight className="w-3 h-3 ml-2" />
        </Button>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MINI SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

function MiniSummary({
  data,
  onViewDocuments,
}: {
  data: AdmissionQASummary;
  onViewDocuments?: (status?: any) => void;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-900">QA Status</span>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            data.complianceStatus.overall === 'compliant'
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-red-100 text-red-700 border-red-300'
          )}
        >
          {data.complianceStatus.score}%
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" />
          <span className="text-gray-700">{data.documentsPending}</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="w-3 h-3 text-red-600" />
          <span className="text-gray-700">{data.documentsReturned}</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-gray-700">{data.documentsApproved}</span>
        </div>
      </div>

      {onViewDocuments && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDocuments()}
          className="w-full mt-2 h-7 text-xs"
        >
          View
        </Button>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockAdmissionQASummary(): AdmissionQASummary {
  const now = new Date();

  return {
    admissionId: 'ADM-12345',
    patientName: 'Margaret Johnson',
    documentsReviewed: 8,
    documentsPending: 2,
    documentsReturned: 1,
    documentsApproved: 5,
    complianceStatus: {
      overall: 'compliant',
      score: 92,
      categories: [
        {
          name: 'Required Documentation',
          status: 'pass',
          details: 'All required documents present',
        },
        {
          name: 'Signature Compliance',
          status: 'pass',
          details: 'All documents properly signed',
        },
        {
          name: 'Billing Compliance',
          status: 'warning',
          details: '1 document needs homebound justification update',
        },
        {
          name: 'Clinical Quality',
          status: 'pass',
          details: 'Assessment quality meets standards',
        },
        {
          name: 'Timeliness',
          status: 'pass',
          details: 'All documents submitted within timeframe',
        },
      ],
    },
    recentDocuments: [
      {
        documentId: 'VN-2024-445',
        documentType: 'Visit Note - SN',
        status: 'pending',
        submittedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reviewerName: 'Jane Smith',
      },
      {
        documentId: 'VN-2024-442',
        documentType: 'Visit Note - SN',
        status: 'returned',
        submittedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        reviewerName: 'Jane Smith',
        issueCount: 3,
        priority: 'urgent',
      },
      {
        documentId: 'VN-2024-440',
        documentType: 'Visit Note - SN',
        status: 'approved',
        submittedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        reviewerName: 'Jane Smith',
      },
      {
        documentId: 'VN-2024-448',
        documentType: 'Visit Note - PT',
        status: 'pending',
        submittedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
      },
      {
        documentId: 'OASIS-2024-123',
        documentType: 'OASIS Start of Care',
        status: 'approved',
        submittedDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        reviewerName: 'Jane Smith',
      },
    ],
    avgTurnaroundHours: 5.2,
    lastReviewDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  };
}
