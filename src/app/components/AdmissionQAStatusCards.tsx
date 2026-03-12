/**
 * Admission QA Status Cards Component
 * 
 * QA status cards for admission dashboard showing documents pending review,
 * returned for correction, and approved. Includes quick links to QA queues.
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, XCircle, CheckCircle, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface QAStatusDocument {
  documentId: string;
  documentType: string;
  submittedDate: string;
  assignedReviewer?: string;
  priority?: 'urgent' | 'high' | 'normal';
  daysInQueue?: number;
}

export interface AdmissionQAStatus {
  admissionId: string;
  patientName: string;
  pendingReview: QAStatusDocument[];
  returnedForCorrection: QAStatusDocument[];
  approved: QAStatusDocument[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface AdmissionQAStatusCardsProps {
  data: AdmissionQAStatus;
  onViewQueue: (queue: 'pending' | 'returned' | 'approved') => void;
  mode?: 'full' | 'compact';
}

export default function AdmissionQAStatusCards({
  data,
  onViewQueue,
  mode = 'full',
}: AdmissionQAStatusCardsProps) {
  const totalDocuments =
    data.pendingReview.length + data.returnedForCorrection.length + data.approved.length;

  if (mode === 'compact') {
    return <CompactQAStatus data={data} onViewQueue={onViewQueue} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-gray-900">QA Documentation Status</h3>
        <p className="text-sm text-gray-600">
          {data.patientName} • {data.admissionId} • {totalDocuments} document
          {totalDocuments !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pending Review */}
        <QAStatusCard
          title="Pending QA Review"
          count={data.pendingReview.length}
          icon={Eye}
          color="amber"
          documents={data.pendingReview}
          onViewQueue={() => onViewQueue('pending')}
          queueLabel="View Pending Queue"
        />

        {/* Returned for Correction */}
        <QAStatusCard
          title="Returned for Correction"
          count={data.returnedForCorrection.length}
          icon={XCircle}
          color="red"
          documents={data.returnedForCorrection}
          onViewQueue={() => onViewQueue('returned')}
          queueLabel="View Returned Documents"
        />

        {/* Approved */}
        <QAStatusCard
          title="Approved"
          count={data.approved.length}
          icon={CheckCircle}
          color="green"
          documents={data.approved}
          onViewQueue={() => onViewQueue('approved')}
          queueLabel="View Approved Documents"
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QA STATUS CARD
// ═══════════════════════════════════════════════════════════════════════════

function QAStatusCard({
  title,
  count,
  icon: Icon,
  color,
  documents,
  onViewQueue,
  queueLabel,
}: {
  title: string;
  count: number;
  icon: any;
  color: string;
  documents: QAStatusDocument[];
  onViewQueue: () => void;
  queueLabel: string;
}) {
  const colorClasses = {
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-700 border-amber-300',
      border: 'border-amber-200',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      badge: 'bg-red-100 text-red-700 border-red-300',
      border: 'border-red-200',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      badge: 'bg-green-100 text-green-700 border-green-300',
      border: 'border-green-200',
    },
  };

  const colors = colorClasses[color as keyof typeof colorClasses];

  const urgentDocs = documents.filter((d) => d.priority === 'urgent').length;

  return (
    <Card className={cn('p-4', colors.border)}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-5 h-5', colors.text)} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900">{count}</span>
            {urgentDocs > 0 && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                {urgentDocs} urgent
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Document List */}
      {documents.length > 0 ? (
        <>
          <div className="space-y-2 mb-3">
            {documents.slice(0, 3).map((doc) => (
              <div key={doc.documentId} className="p-2 bg-white rounded border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{doc.documentType}</span>
                  {doc.priority && doc.priority !== 'normal' && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        doc.priority === 'urgent'
                          ? 'bg-red-100 text-red-700 border-red-300'
                          : 'bg-orange-100 text-orange-700 border-orange-300'
                      )}
                    >
                      {doc.priority}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(doc.submittedDate).toLocaleDateString()}</span>
                  {doc.daysInQueue !== undefined && doc.daysInQueue > 2 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-700 font-medium">
                        {doc.daysInQueue} days in queue
                      </span>
                    </>
                  )}
                </div>
                {doc.assignedReviewer && (
                  <div className="text-xs text-gray-600 mt-1">
                    Reviewer: {doc.assignedReviewer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {documents.length > 3 && (
            <div className="text-xs text-gray-600 mb-3 text-center">
              +{documents.length - 3} more document{documents.length - 3 !== 1 ? 's' : ''}
            </div>
          )}

          <Button variant="outline" size="sm" onClick={onViewQueue} className="w-full">
            {queueLabel}
            <ChevronRight className="w-3 h-3 ml-2" />
          </Button>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No documents in this status</p>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT QA STATUS
// ═══════════════════════════════════════════════════════════════════════════

function CompactQAStatus({
  data,
  onViewQueue,
}: {
  data: AdmissionQAStatus;
  onViewQueue: (queue: 'pending' | 'returned' | 'approved') => void;
}) {
  return (
    <Card className="p-4">
      <h4 className="font-semibold text-gray-900 mb-3 text-sm">QA Status</h4>
      <div className="space-y-2">
        {/* Pending */}
        {data.pendingReview.length > 0 && (
          <button
            onClick={() => onViewQueue('pending')}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-gray-700">Pending Review</span>
            </div>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
              {data.pendingReview.length}
            </Badge>
          </button>
        )}

        {/* Returned */}
        {data.returnedForCorrection.length > 0 && (
          <button
            onClick={() => onViewQueue('returned')}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-700">Returned</span>
            </div>
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
              {data.returnedForCorrection.length}
            </Badge>
          </button>
        )}

        {/* Approved */}
        {data.approved.length > 0 && (
          <button
            onClick={() => onViewQueue('approved')}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Approved</span>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
              {data.approved.length}
            </Badge>
          </button>
        )}

        {data.pendingReview.length === 0 &&
          data.returnedForCorrection.length === 0 &&
          data.approved.length === 0 && (
            <div className="text-center py-3 text-sm text-gray-500">No QA activity</div>
          )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockAdmissionQAStatus(): AdmissionQAStatus {
  const now = new Date();

  return {
    admissionId: 'ADM-12345',
    patientName: 'Margaret Johnson',
    pendingReview: [
      {
        documentId: 'VN-2024-445',
        documentType: 'Visit Note - SN',
        submittedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        assignedReviewer: 'Jane Smith',
        daysInQueue: 1,
      },
      {
        documentId: 'VN-2024-448',
        documentType: 'Visit Note - PT',
        submittedDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        daysInQueue: 3,
      },
    ],
    returnedForCorrection: [
      {
        documentId: 'VN-2024-442',
        documentType: 'Visit Note - SN',
        submittedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'urgent',
        daysInQueue: 5,
      },
    ],
    approved: [
      {
        documentId: 'VN-2024-440',
        documentType: 'Visit Note - SN',
        submittedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        assignedReviewer: 'Jane Smith',
      },
      {
        documentId: 'VN-2024-441',
        documentType: 'Visit Note - PT',
        submittedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        assignedReviewer: 'Bob Johnson',
      },
      {
        documentId: 'OASIS-2024-123',
        documentType: 'OASIS Start of Care',
        submittedDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedReviewer: 'Jane Smith',
      },
    ],
  };
}
