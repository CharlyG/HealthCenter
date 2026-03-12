/**
 * Clinical Documentation List View
 * 
 * Comprehensive document management view for patient admissions
 * Groups documents by category with filtering and search
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { DocumentStatusBadge } from '../components/documentation/DocumentStatusComponents';
import { DocumentStatus } from '../lib/documentStatusSystem';
import {
  FileText,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  Edit,
  PenTool,
  Download,
  MoreVertical,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type DocumentCategory = 
  | 'visit_notes'
  | 'assessments'
  | 'orders'
  | 'plans_of_care';

export type SignatureStatus = 
  | 'unsigned'
  | 'signed'
  | 'cosign_required'
  | 'cosigned';

export interface ClinicalDocumentListItem {
  id: string;
  documentType: string;
  documentTypeLabel: string;
  category: DocumentCategory;
  visitDate: string;
  serviceDate?: string;
  clinicianId: string;
  clinicianName: string;
  clinicianRole: string;
  clinicianCredentials: string;
  status: DocumentStatus;
  signatureStatus: SignatureStatus;
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  signedBy?: string;
  cosignRequiredBy?: string;
  cosignedAt?: string;
  cosignedBy?: string;
  isLocked: boolean;
  canEdit: boolean;
  canSign: boolean;
  canView: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_CONFIG = {
  visit_notes: {
    id: 'visit_notes',
    label: 'Visit Notes',
    icon: FileText,
    color: 'blue',
    description: 'Clinical visit documentation',
  },
  assessments: {
    id: 'assessments',
    label: 'Assessments',
    icon: CheckCircle2,
    color: 'purple',
    description: 'Patient assessments and evaluations',
  },
  orders: {
    id: 'orders',
    label: 'Orders',
    icon: AlertCircle,
    color: 'amber',
    description: 'Physician orders and prescriptions',
  },
  plans_of_care: {
    id: 'plans_of_care',
    label: 'Plans of Care',
    icon: FileText,
    color: 'green',
    description: 'Care plans and treatment protocols',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_DOCUMENTS: ClinicalDocumentListItem[] = [
  // Visit Notes
  {
    id: 'doc-vn-001',
    documentType: 'sn_visit_note',
    documentTypeLabel: 'Skilled Nursing Visit Note',
    category: 'visit_notes',
    visitDate: '2026-03-09',
    serviceDate: '2026-03-09',
    clinicianId: 'user-rn-001',
    clinicianName: 'Maria Santos',
    clinicianRole: 'Registered Nurse',
    clinicianCredentials: 'RN, BSN',
    status: 'signed',
    signatureStatus: 'signed',
    createdAt: '2026-03-09T14:30:00Z',
    updatedAt: '2026-03-09T16:45:00Z',
    signedAt: '2026-03-09T16:45:00Z',
    signedBy: 'Maria Santos, RN, BSN',
    isLocked: true,
    canEdit: false,
    canSign: false,
    canView: true,
  },
  {
    id: 'doc-vn-002',
    documentType: 'pt_visit_note',
    documentTypeLabel: 'PT Visit Note',
    category: 'visit_notes',
    visitDate: '2026-03-08',
    serviceDate: '2026-03-08',
    clinicianId: 'user-pt-001',
    clinicianName: 'Alex Chen',
    clinicianRole: 'Physical Therapist',
    clinicianCredentials: 'PT, DPT',
    status: 'approved',
    signatureStatus: 'cosign_required',
    createdAt: '2026-03-08T10:15:00Z',
    updatedAt: '2026-03-08T11:30:00Z',
    cosignRequiredBy: 'Sarah Kim, RN',
    isLocked: false,
    canEdit: false,
    canSign: true,
    canView: true,
  },
  {
    id: 'doc-vn-003',
    documentType: 'st_visit_note',
    documentTypeLabel: 'ST Visit Note',
    category: 'visit_notes',
    visitDate: '2026-03-07',
    serviceDate: '2026-03-07',
    clinicianId: 'user-st-001',
    clinicianName: 'Michael Chen',
    clinicianRole: 'Speech-Language Pathologist',
    clinicianCredentials: 'SLP, MS, CCC-SLP',
    status: 'returned_for_correction',
    signatureStatus: 'unsigned',
    createdAt: '2026-03-07T13:00:00Z',
    updatedAt: '2026-03-08T09:00:00Z',
    isLocked: false,
    canEdit: true,
    canSign: false,
    canView: true,
  },
  {
    id: 'doc-vn-004',
    documentType: 'sn_visit_note',
    documentTypeLabel: 'Skilled Nursing Visit Note',
    category: 'visit_notes',
    visitDate: '2026-03-06',
    serviceDate: '2026-03-06',
    clinicianId: 'user-rn-002',
    clinicianName: 'Jennifer Adams',
    clinicianRole: 'Registered Nurse',
    clinicianCredentials: 'RN',
    status: 'completed',
    signatureStatus: 'unsigned',
    createdAt: '2026-03-06T15:30:00Z',
    updatedAt: '2026-03-06T16:20:00Z',
    isLocked: false,
    canEdit: true,
    canSign: true,
    canView: true,
  },
  
  // Assessments
  {
    id: 'doc-assess-001',
    documentType: 'oasis_e_soc',
    documentTypeLabel: 'OASIS-E Start of Care',
    category: 'assessments',
    visitDate: '2026-03-01',
    clinicianId: 'user-rn-001',
    clinicianName: 'Maria Santos',
    clinicianRole: 'Registered Nurse',
    clinicianCredentials: 'RN, BSN',
    status: 'signed',
    signatureStatus: 'signed',
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-01T11:30:00Z',
    signedAt: '2026-03-01T11:30:00Z',
    signedBy: 'Maria Santos, RN, BSN',
    isLocked: true,
    canEdit: false,
    canSign: false,
    canView: true,
  },
  {
    id: 'doc-assess-002',
    documentType: 'pt_evaluation',
    documentTypeLabel: 'PT Evaluation',
    category: 'assessments',
    visitDate: '2026-03-02',
    clinicianId: 'user-pt-001',
    clinicianName: 'Alex Chen',
    clinicianRole: 'Physical Therapist',
    clinicianCredentials: 'PT, DPT',
    status: 'approved',
    signatureStatus: 'signed',
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-02T12:45:00Z',
    signedAt: '2026-03-02T12:45:00Z',
    signedBy: 'Alex Chen, PT, DPT',
    isLocked: true,
    canEdit: false,
    canSign: false,
    canView: true,
  },
  {
    id: 'doc-assess-003',
    documentType: 'st_evaluation',
    documentTypeLabel: 'ST Evaluation',
    category: 'assessments',
    visitDate: '2026-03-03',
    clinicianId: 'user-st-001',
    clinicianName: 'Michael Chen',
    clinicianRole: 'Speech-Language Pathologist',
    clinicianCredentials: 'SLP, MS, CCC-SLP',
    status: 'in_progress',
    signatureStatus: 'unsigned',
    createdAt: '2026-03-03T14:00:00Z',
    updatedAt: '2026-03-09T10:30:00Z',
    isLocked: false,
    canEdit: true,
    canSign: false,
    canView: true,
  },
  
  // Orders
  {
    id: 'doc-order-001',
    documentType: 'verbal_order',
    documentTypeLabel: 'Verbal Order',
    category: 'orders',
    visitDate: '2026-03-05',
    clinicianId: 'user-rn-001',
    clinicianName: 'Maria Santos',
    clinicianRole: 'Registered Nurse',
    clinicianCredentials: 'RN, BSN',
    status: 'completed',
    signatureStatus: 'cosign_required',
    createdAt: '2026-03-05T09:15:00Z',
    updatedAt: '2026-03-05T09:30:00Z',
    cosignRequiredBy: 'Dr. Robert Martinez, MD',
    isLocked: false,
    canEdit: false,
    canSign: true,
    canView: true,
  },
  {
    id: 'doc-order-002',
    documentType: 'physician_order',
    documentTypeLabel: 'Physician Order',
    category: 'orders',
    visitDate: '2026-03-01',
    clinicianId: 'user-md-001',
    clinicianName: 'Dr. Robert Martinez',
    clinicianRole: 'Physician',
    clinicianCredentials: 'MD',
    status: 'signed',
    signatureStatus: 'signed',
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-01T08:15:00Z',
    signedAt: '2026-03-01T08:15:00Z',
    signedBy: 'Dr. Robert Martinez, MD',
    isLocked: true,
    canEdit: false,
    canSign: false,
    canView: true,
  },
  
  // Plans of Care
  {
    id: 'doc-poc-001',
    documentType: 'plan_of_care',
    documentTypeLabel: 'Plan of Care',
    category: 'plans_of_care',
    visitDate: '2026-03-01',
    clinicianId: 'user-rn-001',
    clinicianName: 'Maria Santos',
    clinicianRole: 'Registered Nurse',
    clinicianCredentials: 'RN, BSN',
    status: 'signed',
    signatureStatus: 'signed',
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-03-01T13:30:00Z',
    signedAt: '2026-03-01T13:30:00Z',
    signedBy: 'Maria Santos, RN, BSN',
    isLocked: true,
    canEdit: false,
    canSign: false,
    canView: true,
  },
  {
    id: 'doc-poc-002',
    documentType: 'plan_of_care_update',
    documentTypeLabel: 'Plan of Care Update',
    category: 'plans_of_care',
    visitDate: '2026-03-08',
    clinicianId: 'user-rn-001',
    clinicianName: 'Maria Santos',
    clinicianRole: 'Registered Nurse',
    clinicianCredentials: 'RN, BSN',
    status: 'draft',
    signatureStatus: 'unsigned',
    createdAt: '2026-03-08T16:00:00Z',
    updatedAt: '2026-03-08T16:00:00Z',
    isLocked: false,
    canEdit: true,
    canSign: false,
    canView: true,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ClinicalDocumentationListViewProps {
  patientId?: string;
  patientName?: string;
  admissionId?: string;
  documents?: ClinicalDocumentListItem[];
  onDocumentClick?: (documentId: string) => void;
  onDocumentEdit?: (documentId: string) => void;
  onDocumentSign?: (documentId: string) => void;
  showBackButton?: boolean;
}

export default function ClinicalDocumentationListView({
  patientId = 'pat-99888',
  patientName = 'Dorothy Williams',
  admissionId = 'adm-55443',
  documents = MOCK_DOCUMENTS,
  onDocumentClick,
  onDocumentEdit,
  onDocumentSign,
  showBackButton = true,
}: ClinicalDocumentationListViewProps) {
  const navigate = useNavigate();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<DocumentStatus[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<DocumentCategory[]>([]);
  const [selectedSignatureStatus, setSelectedSignatureStatus] = useState<SignatureStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'clinician'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // UI state
  const [collapsedCategories, setCollapsedCategories] = useState<Set<DocumentCategory>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.documentTypeLabel.toLowerCase().includes(query) ||
        doc.clinicianName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(doc => selectedStatuses.includes(doc.status));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(doc => selectedCategories.includes(doc.category));
    }

    // Signature status filter
    if (selectedSignatureStatus !== 'all') {
      filtered = filtered.filter(doc => doc.signatureStatus === selectedSignatureStatus);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime();
      } else if (sortBy === 'type') {
        comparison = a.documentTypeLabel.localeCompare(b.documentTypeLabel);
      } else if (sortBy === 'clinician') {
        comparison = a.clinicianName.localeCompare(b.clinicianName);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, searchQuery, selectedStatuses, selectedCategories, selectedSignatureStatus, sortBy, sortOrder]);

  // Group by category
  const groupedDocuments = useMemo(() => {
    const groups: Record<DocumentCategory, ClinicalDocumentListItem[]> = {
      visit_notes: [],
      assessments: [],
      orders: [],
      plans_of_care: [],
    };

    filteredDocuments.forEach(doc => {
      groups[doc.category].push(doc);
    });

    return groups;
  }, [filteredDocuments]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: documents.length,
      unsigned: documents.filter(d => d.signatureStatus === 'unsigned').length,
      needsCosign: documents.filter(d => d.signatureStatus === 'cosign_required').length,
      needsCorrection: documents.filter(d => d.status === 'returned_for_correction').length,
    };
  }, [documents]);

  const toggleCategory = (category: DocumentCategory) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedCategories([]);
    setSelectedSignatureStatus('all');
  };

  const activeFilterCount = 
    (searchQuery ? 1 : 0) +
    selectedStatuses.length +
    selectedCategories.length +
    (selectedSignatureStatus !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Clinical Documentation
                </h1>
                <p className="text-sm text-gray-600">
                  {patientName} • Admission {admissionId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <FileText className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-4">
            <StatBadge label="Total Documents" value={stats.total} color="blue" />
            <StatBadge label="Unsigned" value={stats.unsigned} color="amber" />
            <StatBadge label="Needs Cosign" value={stats.needsCosign} color="purple" />
            <StatBadge label="Needs Correction" value={stats.needsCorrection} color="red" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documents by type or clinician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-white text-blue-700">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="type">Sort by Type</SelectItem>
              <SelectItem value="clinician">Sort by Clinician</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Document Status */}
              <div className="space-y-3">
                <Label className="font-semibold">Document Status</Label>
                <div className="space-y-2">
                  {(['draft', 'in_progress', 'completed', 'returned_for_correction', 'approved', 'signed'] as DocumentStatus[]).map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStatuses([...selectedStatuses, status]);
                          } else {
                            setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                          }
                        }}
                      />
                      <label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                        <DocumentStatusBadge status={status} size="sm" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <Label className="font-semibold">Category</Label>
                <div className="space-y-2">
                  {Object.values(CATEGORY_CONFIG).map(cat => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.id}`}
                        checked={selectedCategories.includes(cat.id as DocumentCategory)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, cat.id as DocumentCategory]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat.id));
                          }
                        }}
                      />
                      <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                        {cat.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Status */}
              <div className="space-y-3">
                <Label className="font-semibold">Signature Status</Label>
                <Select value={selectedSignatureStatus} onValueChange={(v) => setSelectedSignatureStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Signatures</SelectItem>
                    <SelectItem value="unsigned">Unsigned</SelectItem>
                    <SelectItem value="signed">Signed</SelectItem>
                    <SelectItem value="cosign_required">Cosign Required</SelectItem>
                    <SelectItem value="cosigned">Cosigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Document List */}
      <div className="max-w-7xl mx-auto px-4 pb-8 space-y-6">
        {Object.entries(groupedDocuments).map(([category, docs]) => {
          const config = CATEGORY_CONFIG[category as DocumentCategory];
          const isCollapsed = collapsedCategories.has(category as DocumentCategory);
          const Icon = config.icon;

          if (docs.length === 0) return null;

          return (
            <Card key={category} className="overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category as DocumentCategory)}
                className="w-full px-6 py-4 bg-gray-50 border-b flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                  <Icon className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{config.label}</h3>
                    <p className="text-xs text-gray-600">{config.description}</p>
                  </div>
                </div>
                <Badge variant="outline">{docs.length}</Badge>
              </button>

              {/* Documents */}
              {!isCollapsed && (
                <div className="divide-y">
                  {docs.map(doc => (
                    <DocumentListItem
                      key={doc.id}
                      document={doc}
                      onView={() => onDocumentClick?.(doc.id)}
                      onEdit={() => onDocumentEdit?.(doc.id)}
                      onSign={() => onDocumentSign?.(doc.id)}
                    />
                  ))}
                </div>
              )}
            </Card>
          );
        })}

        {filteredDocuments.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-sm">
                {activeFilterCount > 0
                  ? 'Try adjusting your filters or search query'
                  : 'No clinical documents have been created for this admission yet'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT LIST ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentListItemProps {
  document: ClinicalDocumentListItem;
  onView?: () => void;
  onEdit?: () => void;
  onSign?: () => void;
}

function DocumentListItem({ document, onView, onEdit, onSign }: DocumentListItemProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-medium text-gray-900 truncate">
              {document.documentTypeLabel}
            </h4>
            <DocumentStatusBadge status={document.status} size="sm" />
            <SignatureStatusBadge status={document.signatureStatus} />
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            {/* Visit Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{new Date(document.visitDate).toLocaleDateString()}</span>
            </div>

            {/* Clinician */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="truncate">
                {document.clinicianName}, {document.clinicianCredentials}
              </span>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                Updated {new Date(document.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Additional Info */}
          {(document.cosignRequiredBy || document.signedBy) && (
            <div className="mt-2 text-xs text-gray-500">
              {document.cosignRequiredBy && (
                <div>Cosign required by: {document.cosignRequiredBy}</div>
              )}
              {document.signedBy && document.signedAt && (
                <div>
                  Signed by {document.signedBy} on{' '}
                  {new Date(document.signedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {document.canView && (
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          )}
          
          {document.canEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          
          {document.canSign && (
            <Button size="sm" onClick={onSign}>
              <PenTool className="w-4 h-4 mr-1" />
              Sign
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {document.canEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Document
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                View History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface StatBadgeProps {
  label: string;
  value: number;
  color: 'blue' | 'amber' | 'purple' | 'red';
}

function StatBadge({ label, value, color }: StatBadgeProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={cn('px-4 py-2 rounded-lg border', colorClasses[color])}>
      <div className="text-xs font-medium mb-0.5">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

interface SignatureStatusBadgeProps {
  status: SignatureStatus;
}

function SignatureStatusBadge({ status }: SignatureStatusBadgeProps) {
  const config = {
    unsigned: {
      label: 'Unsigned',
      icon: XCircle,
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    signed: {
      label: 'Signed',
      icon: CheckCircle2,
      className: 'bg-green-100 text-green-700 border-green-300',
    },
    cosign_required: {
      label: 'Cosign Required',
      icon: AlertCircle,
      className: 'bg-amber-100 text-amber-700 border-amber-300',
    },
    cosigned: {
      label: 'Cosigned',
      icon: CheckCircle2,
      className: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge className={cn('flex items-center gap-1 text-xs border', className)}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}
