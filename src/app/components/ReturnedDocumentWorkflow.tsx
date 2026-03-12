/**
 * Returned for Correction Workflow Component
 * 
 * Comprehensive interface for managing clinical orders and certification
 * documents that have been returned for correction. Reduces confusion by
 * clearly displaying return reasons, comments, and correction history.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  AlertCircle,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Edit,
  Send,
  Eye,
  Clock,
  CheckCircle,
  X,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  History,
  Filter,
  Search,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type DocumentType =
  | 'physician-order'
  | 'verbal-order'
  | 'plan-of-care'
  | 'recertification'
  | 'discharge-certification';

export type ReturnStatus =
  | 'returned-needs-correction'
  | 'in-correction'
  | 'ready-for-resubmission'
  | 'resubmitted-pending-review';

export interface ReturnComment {
  id: string;
  author: {
    name: string;
    role: string;
  };
  timestamp: string;
  text: string;
  type: 'return-reason' | 'correction-note' | 'resubmission-note';
}

export interface CorrectionHistoryEntry {
  id: string;
  action: 'returned' | 'correction-started' | 'correction-saved' | 'resubmitted' | 'approved';
  timestamp: string;
  user: {
    name: string;
    role: string;
  };
  details?: string;
}

export interface ReturnedDocument {
  id: string;
  documentType: DocumentType;
  documentTitle: string;
  patient: {
    id: string;
    name: string;
  };
  admission: {
    id: string;
  };
  returnedBy: {
    name: string;
    role: string;
  };
  returnedDate: string;
  returnReason: string;
  status: ReturnStatus;
  comments: ReturnComment[];
  correctionHistory: CorrectionHistoryEntry[];
  originalSubmissionDate: string;
  daysInCorrectionQueue: number;
  assignedTo?: {
    name: string;
    role: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'physician-order': 'Physician Order',
  'verbal-order': 'Verbal Order',
  'plan-of-care': 'Plan of Care / 485',
  'recertification': 'Recertification',
  'discharge-certification': 'Discharge Certification',
};

const STATUS_CONFIG: Record<
  ReturnStatus,
  { label: string; color: string; bgColor: string; icon: any }
> = {
  'returned-needs-correction': {
    label: 'Needs Correction',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: AlertCircle,
  },
  'in-correction': {
    label: 'In Correction',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: Edit,
  },
  'ready-for-resubmission': {
    label: 'Ready for Resubmission',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    icon: CheckCircle,
  },
  'resubmitted-pending-review': {
    label: 'Resubmitted - Pending Review',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    icon: Clock,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

function generateMockReturnedDocuments(): ReturnedDocument[] {
  const now = new Date();

  return [
    {
      id: 'RET-001',
      documentType: 'plan-of-care',
      documentTitle: 'Initial Plan of Care - 60 day certification',
      patient: { id: 'PAT-001', name: 'Margaret Johnson' },
      admission: { id: 'ADM-12345' },
      returnedBy: { name: 'Dr. Sarah Mitchell', role: 'Physician' },
      returnedDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      returnReason: 'Visit frequency does not match disciplines selected',
      status: 'returned-needs-correction',
      comments: [
        {
          id: 'CMT-001',
          author: { name: 'Dr. Sarah Mitchell', role: 'Physician' },
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          text: 'Speech Therapy is listed as a discipline, but no visit frequency is specified for ST. Please add frequency or remove the discipline.',
          type: 'return-reason',
        },
        {
          id: 'CMT-002',
          author: { name: 'Dr. Sarah Mitchell', role: 'Physician' },
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          text: 'Also, the primary diagnosis ICD-10 code appears incomplete (I50. should have additional digit).',
          type: 'return-reason',
        },
      ],
      correctionHistory: [
        {
          id: 'HIST-001',
          action: 'returned',
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user: { name: 'Dr. Sarah Mitchell', role: 'Physician' },
          details: 'Document returned for correction',
        },
      ],
      originalSubmissionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      daysInCorrectionQueue: 2,
      assignedTo: { name: 'Emily Chen', role: 'RN Case Manager' },
    },
    {
      id: 'RET-002',
      documentType: 'verbal-order',
      documentTitle: 'Increase Lasix to 40mg PO daily',
      patient: { id: 'PAT-002', name: 'Robert Williams' },
      admission: { id: 'ADM-12346' },
      returnedBy: { name: 'Dr. James Patterson', role: 'Physician' },
      returnedDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      returnReason: 'Order date/time not specified',
      status: 'in-correction',
      comments: [
        {
          id: 'CMT-003',
          author: { name: 'Dr. James Patterson', role: 'Physician' },
          timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          text: 'Please specify the exact date and time this verbal order was received. Required for regulatory compliance.',
          type: 'return-reason',
        },
        {
          id: 'CMT-004',
          author: { name: 'Michael Torres', role: 'Clinical Manager' },
          timestamp: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
          text: 'Working on this correction now. Will add order date/time from clinical notes.',
          type: 'correction-note',
        },
      ],
      correctionHistory: [
        {
          id: 'HIST-002',
          action: 'returned',
          timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user: { name: 'Dr. James Patterson', role: 'Physician' },
          details: 'Document returned for correction',
        },
        {
          id: 'HIST-003',
          action: 'correction-started',
          timestamp: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
          user: { name: 'Michael Torres', role: 'Clinical Manager' },
          details: 'Started making corrections',
        },
      ],
      originalSubmissionDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      daysInCorrectionQueue: 1,
      assignedTo: { name: 'Michael Torres', role: 'Clinical Manager' },
    },
    {
      id: 'RET-003',
      documentType: 'recertification',
      documentTitle: 'Recertification - Period 2',
      patient: { id: 'PAT-003', name: 'Patricia Davis' },
      admission: { id: 'ADM-12347' },
      returnedBy: { name: 'Dr. Amanda Rodriguez', role: 'Medical Director' },
      returnedDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      returnReason: 'Clinical goals not measurable',
      status: 'ready-for-resubmission',
      comments: [
        {
          id: 'CMT-005',
          author: { name: 'Dr. Amanda Rodriguez', role: 'Medical Director' },
          timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          text: 'The clinical goals listed are too vague. Goals must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound). For example, "Patient will improve mobility" should be "Patient will ambulate 50 feet with walker independently by end of cert period".',
          type: 'return-reason',
        },
        {
          id: 'CMT-006',
          author: { name: 'Emily Chen', role: 'RN Case Manager' },
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          text: 'Updated all 4 clinical goals to be SMART format with measurable outcomes and specific timeframes. Ready for resubmission.',
          type: 'correction-note',
        },
      ],
      correctionHistory: [
        {
          id: 'HIST-004',
          action: 'returned',
          timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          user: { name: 'Dr. Amanda Rodriguez', role: 'Medical Director' },
          details: 'Document returned for correction',
        },
        {
          id: 'HIST-005',
          action: 'correction-started',
          timestamp: new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000).toISOString(),
          user: { name: 'Emily Chen', role: 'RN Case Manager' },
          details: 'Started making corrections',
        },
        {
          id: 'HIST-006',
          action: 'correction-saved',
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          user: { name: 'Emily Chen', role: 'RN Case Manager' },
          details: 'Corrections completed - updated clinical goals to SMART format',
        },
      ],
      originalSubmissionDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      daysInCorrectionQueue: 4,
      assignedTo: { name: 'Emily Chen', role: 'RN Case Manager' },
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ReturnedDocumentWorkflowProps {
  onOpenDocument?: (docId: string) => void;
  onEditDocument?: (docId: string) => void;
  onResubmit?: (docId: string) => void;
}

export default function ReturnedDocumentWorkflow({
  onOpenDocument,
  onEditDocument,
  onResubmit,
}: ReturnedDocumentWorkflowProps) {
  const [documents] = useState<ReturnedDocument[]>(generateMockReturnedDocuments());
  const [selectedDocId, setSelectedDocId] = useState<string | null>(documents[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'all'>('all');
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch =
      !searchTerm ||
      doc.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Returned for Correction
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage documents returned for correction and track resubmissions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                {documents.length} Documents
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Document List */}
        <div className="w-96 bg-white border-r flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as ReturnStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="returned-needs-correction">Needs Correction</option>
              <option value="in-correction">In Correction</option>
              <option value="ready-for-resubmission">Ready for Resubmission</option>
              <option value="resubmitted-pending-review">Resubmitted</option>
            </select>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocs.map(doc => (
              <DocumentListItem
                key={doc.id}
                document={doc}
                isSelected={selectedDocId === doc.id}
                onClick={() => setSelectedDocId(doc.id)}
              />
            ))}
            {filteredDocs.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No documents found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Document Details */}
        {selectedDoc ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Document Header */}
            <div className="bg-white border-b p-6">
              <DocumentHeader
                document={selectedDoc}
                onOpenDocument={() => onOpenDocument?.(selectedDoc.id)}
                onEditDocument={() => onEditDocument?.(selectedDoc.id)}
                onResubmit={() => onResubmit?.(selectedDoc.id)}
                onShowHistory={() => setShowHistoryPanel(!showHistoryPanel)}
              />
            </div>

            {/* Details Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="p-6 space-y-6">
                {/* Return Information */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Return Information
                  </h3>
                  <ReturnInformationSection document={selectedDoc} />
                </Card>

                {/* Comments */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Comments ({selectedDoc.comments.length})
                  </h3>
                  <CommentsSection comments={selectedDoc.comments} />
                </Card>

                {/* Correction History */}
                {showHistoryPanel && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <History className="w-5 h-5 text-purple-600" />
                      Correction History
                    </h3>
                    <CorrectionHistorySection history={selectedDoc.correctionHistory} />
                  </Card>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-3 text-gray-400" />
              <p>Select a document to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT LIST ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentListItemProps {
  document: ReturnedDocument;
  isSelected: boolean;
  onClick: () => void;
}

function DocumentListItem({ document, isSelected, onClick }: DocumentListItemProps) {
  const statusConfig = STATUS_CONFIG[document.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 border-b cursor-pointer transition-colors',
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{document.documentTitle}</h4>
          <p className="text-sm text-gray-600 mt-0.5">
            {DOCUMENT_TYPE_LABELS[document.documentType]}
          </p>
        </div>
      </div>

      <div className="space-y-2 mt-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700">{document.patient.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700">
            Returned {new Date(document.returnedDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-700">{document.daysInCorrectionQueue} days in queue</span>
        </div>
      </div>

      <div className="mt-3">
        <Badge
          style={{
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color,
          }}
          className="text-xs"
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT HEADER
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentHeaderProps {
  document: ReturnedDocument;
  onOpenDocument: () => void;
  onEditDocument: () => void;
  onResubmit: () => void;
  onShowHistory: () => void;
}

function DocumentHeader({
  document,
  onOpenDocument,
  onEditDocument,
  onResubmit,
  onShowHistory,
}: DocumentHeaderProps) {
  const statusConfig = STATUS_CONFIG[document.status];
  const StatusIcon = statusConfig.icon;
  const canResubmit = document.status === 'ready-for-resubmission';

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900">{document.documentTitle}</h3>
            <Badge
              style={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.color,
              }}
            >
              <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{DOCUMENT_TYPE_LABELS[document.documentType]}</span>
            <span>•</span>
            <span>{document.id}</span>
            <span>•</span>
            <span>{document.patient.name}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onOpenDocument}>
          <Eye className="w-4 h-4 mr-2" />
          View Document
        </Button>
        <Button variant="outline" size="sm" onClick={onEditDocument}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Document
        </Button>
        <Button variant="outline" size="sm" onClick={onShowHistory}>
          <History className="w-4 h-4 mr-2" />
          Show History
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onResubmit}
          disabled={!canResubmit}
        >
          <Send className="w-4 h-4 mr-2" />
          Resubmit for Review
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RETURN INFORMATION SECTION
// ═══════════════════════════════════════════════════════════════════════════

function ReturnInformationSection({ document }: { document: ReturnedDocument }) {
  return (
    <div className="space-y-4">
      {/* Return Reason */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-medium text-red-900 mb-2">Reason for Return</h4>
        <p className="text-sm text-red-700">{document.returnReason}</p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Returned By */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Returned By</p>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{document.returnedBy.name}</p>
              <p className="text-xs text-gray-600">{document.returnedBy.role}</p>
            </div>
          </div>
        </div>

        {/* Returned Date */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Returned Date</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="font-medium text-gray-900">
              {new Date(document.returnedDate).toLocaleDateString()} at{' '}
              {new Date(document.returnedDate).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Original Submission */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Original Submission</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <p className="font-medium text-gray-900">
              {new Date(document.originalSubmissionDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Days in Queue */}
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Days in Correction Queue</p>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <p className="font-bold text-gray-900">{document.daysInCorrectionQueue} days</p>
          </div>
        </div>

        {/* Assigned To */}
        {document.assignedTo && (
          <div className="col-span-2">
            <p className="text-sm font-medium text-gray-600 mb-1">Assigned To</p>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{document.assignedTo.name}</p>
                <p className="text-xs text-gray-600">{document.assignedTo.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMENTS SECTION
// ═══════════════════════════════════════════════════════════════════════════

function CommentsSection({ comments }: { comments: ReturnComment[] }) {
  const getCommentTypeConfig = (type: ReturnComment['type']) => {
    switch (type) {
      case 'return-reason':
        return {
          label: 'Return Reason',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
        };
      case 'correction-note':
        return {
          label: 'Correction Note',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
        };
      case 'resubmission-note':
        return {
          label: 'Resubmission Note',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
        };
    }
  };

  return (
    <div className="space-y-4">
      {comments.map(comment => {
        const config = getCommentTypeConfig(comment.type);
        return (
          <div
            key={comment.id}
            className={cn(
              'p-4 border rounded-lg',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className={cn('w-4 h-4', config.iconColor)} />
                <div>
                  <p className="font-medium text-gray-900">{comment.author.name}</p>
                  <p className="text-xs text-gray-600">{comment.author.role}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mb-2">{comment.text}</p>
            <p className="text-xs text-gray-500">
              {new Date(comment.timestamp).toLocaleDateString()} at{' '}
              {new Date(comment.timestamp).toLocaleTimeString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CORRECTION HISTORY SECTION
// ═══════════════════════════════════════════════════════════════════════════

function CorrectionHistorySection({ history }: { history: CorrectionHistoryEntry[] }) {
  const getActionConfig = (action: CorrectionHistoryEntry['action']) => {
    switch (action) {
      case 'returned':
        return {
          label: 'Returned',
          icon: RotateCcw,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        };
      case 'correction-started':
        return {
          label: 'Correction Started',
          icon: Edit,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
        };
      case 'correction-saved':
        return {
          label: 'Correction Saved',
          icon: CheckCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case 'resubmitted':
        return {
          label: 'Resubmitted',
          icon: Send,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        };
      case 'approved':
        return {
          label: 'Approved',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
    }
  };

  return (
    <div className="space-y-4">
      {history.map((entry, index) => {
        const config = getActionConfig(entry.action);
        const ActionIcon = config.icon;
        const isLast = index === history.length - 1;

        return (
          <div key={entry.id} className="flex gap-4">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', config.bgColor)}>
                <ActionIcon className={cn('w-4 h-4', config.color)} />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-gray-900">{config.label}</p>
                <Badge variant="outline" className="text-xs">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 mb-1">
                {entry.user.name} ({entry.user.role})
              </p>
              {entry.details && (
                <p className="text-sm text-gray-600">{entry.details}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
