import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  ClipboardCheck,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit3,
  FileText,
  ClipboardList,
  FileSignature,
  Send,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { fetchQADocuments } from '../lib/clinicalApi';

// QA Status type
type QAStatus = 'in_progress' | 'completed' | 'returned' | 'corrected' | 'approved';

// Document types
const DOCUMENT_TYPES = [
  { value: 'visit_note', label: 'Visit Note', icon: FileText },
  { value: 'plan_of_care', label: 'Plan of Care', icon: ClipboardList },
  { value: 'verbal_order', label: 'Verbal Order', icon: FileSignature },
] as const;

interface QADocument {
  id: string;
  documentType: 'visit_note' | 'plan_of_care' | 'verbal_order';
  documentId: string;
  patientName: string;
  patientMrn: string;
  documentTitle: string;
  author: string;
  submittedAt: string;
  qaStatus: QAStatus;
  assignedTo?: string;
  lastReviewedAt?: string;
  reviewedBy?: string;
  returnReason?: string;
  priority: 'low' | 'medium' | 'high';
  daysInQueue: number;
}

function getStatusInfo(status: QAStatus) {
  const statusMap = {
    in_progress: {
      label: 'In Progress',
      variant: 'secondary' as const,
      icon: Clock,
      color: 'bg-gray-100 text-gray-700',
      badge: 'secondary' as const,
    },
    completed: {
      label: 'Completed',
      variant: 'default' as const,
      icon: Send,
      color: 'bg-blue-100 text-blue-700',
      badge: 'default' as const,
    },
    returned: {
      label: 'Returned for Correction',
      variant: 'destructive' as const,
      icon: AlertCircle,
      color: 'bg-red-100 text-red-700',
      badge: 'destructive' as const,
    },
    corrected: {
      label: 'Corrected',
      variant: 'default' as const,
      icon: Edit3,
      color: 'bg-amber-100 text-amber-700',
      badge: 'default' as const,
    },
    approved: {
      label: 'Approved',
      variant: 'default' as const,
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-700',
      badge: 'default' as const,
    },
  };
  return statusMap[status];
}

function getPriorityInfo(priority: 'low' | 'medium' | 'high') {
  const priorityMap = {
    low: { label: 'Low', variant: 'secondary' as const },
    medium: { label: 'Medium', variant: 'default' as const },
    high: { label: 'High', variant: 'destructive' as const },
  };
  return priorityMap[priority];
}

export default function QAReview() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [documents, setDocuments] = useState<QADocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const fetchedDocuments = await fetchQADocuments();
        setDocuments(fetchedDocuments);
      } catch (error) {
        console.error('Error fetching QA documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filter and search
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.author.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;
      const matchesStatus = statusFilter === 'all' || doc.qaStatus === statusFilter;
      const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;

      return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });
  }, [searchTerm, typeFilter, statusFilter, priorityFilter, documents]);

  // Stats
  const stats = {
    inQueue: documents.filter(
      (d) => d.qaStatus === 'completed' || d.qaStatus === 'corrected'
    ).length,
    inReview: documents.filter((d) => d.assignedTo && d.qaStatus !== 'approved').length,
    returned: documents.filter((d) => d.qaStatus === 'returned').length,
    approved: documents.filter((d) => d.qaStatus === 'approved').length,
  };

  return (
    <div className="size-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/clinical')}>
                ← Back
              </Button>
              <ClipboardCheck className="size-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">QA Review</h1>
                <p className="text-gray-600">Quality assurance and document review workflow</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Queue</CardDescription>
              <CardTitle className="text-3xl">{stats.inQueue}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Review</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.inReview}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Returned</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.returned}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Approved Today</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Ready for Review</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="corrected">Corrected</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <Filter className="size-4 mr-2" />
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents for Review ({filteredDocuments.length})</CardTitle>
            <CardDescription>
              {filteredDocuments.length === 0
                ? 'No documents for review'
                : `Showing ${filteredDocuments.length} document${filteredDocuments.length === 1 ? '' : 's'}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="size-12 mx-auto mb-4 text-gray-400 animate-spin" />
                <p className="text-lg font-medium text-gray-900 mb-2">Loading documents</p>
                <p className="text-sm text-gray-500">Please wait while we fetch the documents</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="size-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">No documents in queue</p>
                <p className="text-sm text-gray-500">
                  Documents submitted for review will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => {
                  const statusInfo = getStatusInfo(doc.qaStatus);
                  const StatusIcon = statusInfo.icon;
                  const priorityInfo = getPriorityInfo(doc.priority);
                  const docType = DOCUMENT_TYPES.find((t) => t.value === doc.documentType);
                  const DocTypeIcon = docType?.icon || FileText;

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        navigate(`/clinical/qa-review/${doc.documentType}/${doc.documentId}`)
                      }
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${statusInfo.color}`}>
                          <StatusIcon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <DocTypeIcon className="size-4 text-gray-500" />
                            <h3 className="font-semibold text-gray-900">{doc.documentTitle}</h3>
                            <Badge variant="outline" className="text-xs">
                              {doc.patientMrn}
                            </Badge>
                            <Badge variant={priorityInfo.variant} className="text-xs">
                              {priorityInfo.label} Priority
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-1">
                            <span>Patient: {doc.patientName}</span>
                            <span>Author: {doc.author}</span>
                            <span>Type: {docType?.label}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Submitted: {new Date(doc.submittedAt).toLocaleString()}</span>
                            <span>Days in queue: {doc.daysInQueue}</span>
                            {doc.assignedTo && <span>Assigned to: {doc.assignedTo}</span>}
                            {doc.lastReviewedAt && (
                              <span>
                                Last reviewed: {new Date(doc.lastReviewedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                          {doc.returnReason && (
                            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                              <strong>Return reason:</strong> {doc.returnReason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={statusInfo.badge}>{statusInfo.label}</Badge>
                        <ChevronRight className="size-5 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}