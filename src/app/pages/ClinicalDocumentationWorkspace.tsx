/**
 * Clinical Documentation Workspace
 * 
 * Comprehensive documentation workspace for home health agencies
 * Displays all clinical documentation for the selected admission
 * Organized by category with filtering, search, and creation capabilities
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { DocumentStatusBadge } from '../components/documentation/DocumentStatusComponents';
import { DocumentStatus } from '../lib/documentStatusSystem';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  Calendar,
  User,
  Eye,
  Edit,
  PenTool,
  MoreVertical,
  Stethoscope,
  ClipboardList,
  FileCheck,
  FolderOpen,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
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
  | 'visit_documentation'
  | 'assessments'
  | 'orders'
  | 'plans_of_care';

export type Discipline = 
  | 'SN'  // Skilled Nursing
  | 'PT'  // Physical Therapy
  | 'OT'  // Occupational Therapy
  | 'ST'  // Speech Therapy
  | 'HHA' // Home Health Aide
  | 'MSW' // Medical Social Worker
  | 'MD'  // Physician
  | 'RN'  // Registered Nurse
  | 'PTA' // Physical Therapy Assistant
  | 'COTA'; // Certified Occupational Therapy Assistant

export type SignatureStatus = 
  | 'unsigned'
  | 'signed'
  | 'cosign_required'
  | 'cosigned';

export interface ClinicalDocument {
  id: string;
  documentType: string;
  documentTypeLabel: string;
  category: DocumentCategory;
  discipline: Discipline;
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
  isLocked: boolean;
  canEdit: boolean;
  canSign: boolean;
  canView: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_ADMISSION = {
  id: 'adm-55443',
  patientId: 'pat-99888',
  patientName: 'Dorothy Williams',
  mrn: 'MRN-778899',
  startOfCare: '2026-03-01',
  currentPeriod: 'Period 1 of 2',
  certificationPeriod: '03/01/2026 - 04/29/2026',
};

const MOCK_DOCUMENTS: ClinicalDocument[] = [
  // Visit Documentation - SN
  {
    id: 'doc-sn-001',
    documentType: 'sn_visit_note',
    documentTypeLabel: 'SN Visit Note',
    category: 'visit_documentation',
    discipline: 'SN',
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
    id: 'doc-sn-002',
    documentType: 'sn_visit_note',
    documentTypeLabel: 'SN Visit Note',
    category: 'visit_documentation',
    discipline: 'SN',
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
  {
    id: 'doc-sn-003',
    documentType: 'sn_visit_note',
    documentTypeLabel: 'SN Visit Note',
    category: 'visit_documentation',
    discipline: 'SN',
    visitDate: '2026-03-03',
    serviceDate: '2026-03-03',
    clinicianId: 'user-rn-001',
    clinicianName: 'Maria Santos',
    clinicianRole: 'Registered Nurse',
    clinicianCredentials: 'RN, BSN',
    status: 'signed',
    signatureStatus: 'signed',
    createdAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-03T11:30:00Z',
    signedAt: '2026-03-03T11:30:00Z',
    signedBy: 'Maria Santos, RN, BSN',
    isLocked: true,
    canEdit: false,
    canSign: false,
    canView: true,
  },
  
  // Visit Documentation - PT
  {
    id: 'doc-pt-001',
    documentType: 'pt_visit_note',
    documentTypeLabel: 'PT Visit Note',
    category: 'visit_documentation',
    discipline: 'PT',
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
    isLocked: false,
    canEdit: false,
    canSign: true,
    canView: true,
  },
  {
    id: 'doc-pt-002',
    documentType: 'pt_visit_note',
    documentTypeLabel: 'PT Visit Note',
    category: 'visit_documentation',
    discipline: 'PT',
    visitDate: '2026-03-05',
    serviceDate: '2026-03-05',
    clinicianId: 'user-pt-001',
    clinicianName: 'Alex Chen',
    clinicianRole: 'Physical Therapist',
    clinicianCredentials: 'PT, DPT',
    status: 'signed',
    signatureStatus: 'signed',
    createdAt: '2026-03-05T14:00:00Z',
    updatedAt: '2026-03-05T15:20:00Z',
    signedAt: '2026-03-05T15:20:00Z',
    signedBy: 'Alex Chen, PT, DPT',
    isLocked: true,
    canEdit: false,
    canSign: false,
    canView: true,
  },
  
  // Visit Documentation - ST
  {
    id: 'doc-st-001',
    documentType: 'st_visit_note',
    documentTypeLabel: 'ST Visit Note',
    category: 'visit_documentation',
    discipline: 'ST',
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
  
  // Visit Documentation - OT
  {
    id: 'doc-ot-001',
    documentType: 'ot_visit_note',
    documentTypeLabel: 'OT Visit Note',
    category: 'visit_documentation',
    discipline: 'OT',
    visitDate: '2026-03-04',
    serviceDate: '2026-03-04',
    clinicianId: 'user-ot-001',
    clinicianName: 'Sarah Johnson',
    clinicianRole: 'Occupational Therapist',
    clinicianCredentials: 'OT, MOT',
    status: 'signed',
    signatureStatus: 'signed',
    createdAt: '2026-03-04T11:00:00Z',
    updatedAt: '2026-03-04T12:15:00Z',
    signedAt: '2026-03-04T12:15:00Z',
    signedBy: 'Sarah Johnson, OT, MOT',
    isLocked: true,
    canEdit: false,
    canSign: false,
    canView: true,
  },
  
  // Visit Documentation - HHA
  {
    id: 'doc-hha-001',
    documentType: 'hha_visit_note',
    documentTypeLabel: 'HHA Visit Note',
    category: 'visit_documentation',
    discipline: 'HHA',
    visitDate: '2026-03-09',
    serviceDate: '2026-03-09',
    clinicianId: 'user-hha-001',
    clinicianName: 'Lisa Martinez',
    clinicianRole: 'Home Health Aide',
    clinicianCredentials: 'HHA',
    status: 'in_progress',
    signatureStatus: 'unsigned',
    createdAt: '2026-03-09T08:00:00Z',
    updatedAt: '2026-03-09T10:30:00Z',
    isLocked: false,
    canEdit: true,
    canSign: false,
    canView: true,
  },
  
  // Visit Documentation - MSW
  {
    id: 'doc-msw-001',
    documentType: 'msw_visit_note',
    documentTypeLabel: 'MSW Visit Note',
    category: 'visit_documentation',
    discipline: 'MSW',
    visitDate: '2026-03-02',
    serviceDate: '2026-03-02',
    clinicianId: 'user-msw-001',
    clinicianName: 'David Kim',
    clinicianRole: 'Medical Social Worker',
    clinicianCredentials: 'MSW, LCSW',
    status: 'signed',
    signatureStatus: 'signed',
    createdAt: '2026-03-02T15:00:00Z',
    updatedAt: '2026-03-02T16:30:00Z',
    signedAt: '2026-03-02T16:30:00Z',
    signedBy: 'David Kim, MSW, LCSW',
    isLocked: true,
    canEdit: false,
    canSign: false,
    canView: true,
  },
  
  // Assessments
  {
    id: 'doc-assess-001',
    documentType: 'oasis_e_soc',
    documentTypeLabel: 'OASIS-E Start of Care',
    category: 'assessments',
    discipline: 'SN',
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
    discipline: 'PT',
    visitDate: '2026-03-02',
    clinicianId: 'user-pt-001',
    clinicianName: 'Alex Chen',
    clinicianRole: 'Physical Therapist',
    clinicianCredentials: 'PT, DPT',
    status: 'signed',
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
    discipline: 'ST',
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
    discipline: 'SN',
    visitDate: '2026-03-05',
    clinicianId: 'user-rn-001',
    clinicianName: 'Maria Santos',
    clinicianRole: 'Registered Nurse',
    clinicianCredentials: 'RN, BSN',
    status: 'completed',
    signatureStatus: 'cosign_required',
    createdAt: '2026-03-05T09:15:00Z',
    updatedAt: '2026-03-05T09:30:00Z',
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
    discipline: 'MD',
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
    documentTypeLabel: 'Plan of Care (485)',
    category: 'plans_of_care',
    discipline: 'SN',
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
    discipline: 'SN',
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
// MAIN WORKSPACE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ClinicalDocumentationWorkspace() {
  const navigate = useNavigate();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisciplines, setSelectedDisciplines] = useState<Discipline[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<DocumentStatus[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createCategory, setCreateCategory] = useState<DocumentCategory>('visit_documentation');
  
  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = MOCK_DOCUMENTS;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.documentTypeLabel.toLowerCase().includes(query) ||
        doc.clinicianName.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Discipline filter
    if (selectedDisciplines.length > 0) {
      filtered = filtered.filter(doc => selectedDisciplines.includes(doc.discipline));
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(doc => selectedStatuses.includes(doc.status));
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedDisciplines, selectedStatuses]);

  // Group by category
  const documentsByCategory = useMemo(() => {
    const groups: Record<DocumentCategory, ClinicalDocument[]> = {
      visit_documentation: [],
      assessments: [],
      orders: [],
      plans_of_care: [],
    };

    filteredDocuments.forEach(doc => {
      groups[doc.category].push(doc);
    });

    // Sort by date descending
    Object.keys(groups).forEach(key => {
      groups[key as DocumentCategory].sort((a, b) => 
        new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
      );
    });

    return groups;
  }, [filteredDocuments]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: MOCK_DOCUMENTS.length,
      unsigned: MOCK_DOCUMENTS.filter(d => d.signatureStatus === 'unsigned').length,
      needsCosign: MOCK_DOCUMENTS.filter(d => d.signatureStatus === 'cosign_required').length,
      needsCorrection: MOCK_DOCUMENTS.filter(d => d.status === 'returned_for_correction').length,
      compliant: Math.round((MOCK_DOCUMENTS.filter(d => d.status === 'signed').length / MOCK_DOCUMENTS.length) * 100),
    };
  }, []);

  const handleCreateDocument = (category: DocumentCategory, documentType: string) => {
    console.log('Creating document:', category, documentType);
    setShowCreateDialog(false);
    // Navigate to appropriate editor
    if (documentType === 'oasis_e_soc') {
      navigate('/oasis-assessment');
    } else if (documentType.startsWith('pt_')) {
      navigate('/physical-therapy-module');
    } else if (documentType.startsWith('st_')) {
      navigate('/speech-therapy-module');
    }
  };

  const activeFilterCount = 
    (searchQuery ? 1 : 0) +
    selectedDisciplines.length +
    selectedStatuses.length +
    (selectedCategory !== 'all' ? 1 : 0);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Clinical Documentation
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <span>{MOCK_ADMISSION.patientName}</span>
                <span>•</span>
                <span>MRN: {MOCK_ADMISSION.mrn}</span>
                <span>•</span>
                <span>{MOCK_ADMISSION.currentPeriod}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Document</DialogTitle>
                    <DialogDescription>
                      Select the type of clinical document to create for {MOCK_ADMISSION.patientName}
                    </DialogDescription>
                  </DialogHeader>
                  <CreateDocumentDialog 
                    onSelect={handleCreateDocument}
                    onCancel={() => setShowCreateDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              label="Total Documents"
              value={stats.total}
              icon={FileText}
              color="blue"
            />
            <StatCard
              label="Unsigned"
              value={stats.unsigned}
              icon={XCircle}
              color="amber"
            />
            <StatCard
              label="Needs Cosign"
              value={stats.needsCosign}
              icon={AlertCircle}
              color="purple"
            />
            <StatCard
              label="Needs Correction"
              value={stats.needsCorrection}
              icon={AlertCircle}
              color="red"
            />
            <StatCard
              label="Compliance"
              value={`${stats.compliant}%`}
              icon={TrendingUp}
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Discipline Filter */}
          <DisciplineFilter
            selected={selectedDisciplines}
            onChange={setSelectedDisciplines}
          />

          {/* Status Filter */}
          <StatusFilter
            selected={selectedStatuses}
            onChange={setSelectedStatuses}
          />

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedDisciplines([]);
                setSelectedStatuses([]);
                setSelectedCategory('all');
              }}
            >
              Clear ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)} className="h-full flex flex-col">
          <div className="bg-white border-b px-6">
            <TabsList className="h-12">
              <TabsTrigger value="all" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                All Documents
                <Badge variant="secondary">{filteredDocuments.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="visit_documentation" className="gap-2">
                <Stethoscope className="w-4 h-4" />
                Visit Documentation
                <Badge variant="secondary">{documentsByCategory.visit_documentation.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="assessments" className="gap-2">
                <ClipboardList className="w-4 h-4" />
                Assessments
                <Badge variant="secondary">{documentsByCategory.assessments.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <FileCheck className="w-4 h-4" />
                Orders
                <Badge variant="secondary">{documentsByCategory.orders.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="plans_of_care" className="gap-2">
                <FileText className="w-4 h-4" />
                Plans of Care
                <Badge variant="secondary">{documentsByCategory.plans_of_care.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="all" className="mt-0">
                <AllDocumentsView documents={filteredDocuments} />
              </TabsContent>
              
              <TabsContent value="visit_documentation" className="mt-0">
                <CategoryDocumentsView 
                  documents={documentsByCategory.visit_documentation}
                  category="visit_documentation"
                />
              </TabsContent>
              
              <TabsContent value="assessments" className="mt-0">
                <CategoryDocumentsView 
                  documents={documentsByCategory.assessments}
                  category="assessments"
                />
              </TabsContent>
              
              <TabsContent value="orders" className="mt-0">
                <CategoryDocumentsView 
                  documents={documentsByCategory.orders}
                  category="orders"
                />
              </TabsContent>
              
              <TabsContent value="plans_of_care" className="mt-0">
                <CategoryDocumentsView 
                  documents={documentsByCategory.plans_of_care}
                  category="plans_of_care"
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT VIEWS
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentsViewProps {
  documents: ClinicalDocument[];
  category?: DocumentCategory;
}

function AllDocumentsView({ documents }: DocumentsViewProps) {
  if (documents.length === 0) {
    return <EmptyState message="No documents found" />;
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}

function CategoryDocumentsView({ documents, category }: DocumentsViewProps) {
  if (documents.length === 0) {
    return <EmptyState message={`No ${category?.replace('_', ' ')} found`} />;
  }

  // Group by discipline for visit documentation
  if (category === 'visit_documentation') {
    const byDiscipline: Record<string, ClinicalDocument[]> = {};
    documents.forEach(doc => {
      if (!byDiscipline[doc.discipline]) {
        byDiscipline[doc.discipline] = [];
      }
      byDiscipline[doc.discipline].push(doc);
    });

    return (
      <div className="space-y-6">
        {Object.entries(byDiscipline).map(([discipline, docs]) => (
          <div key={discipline}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <DisciplineBadge discipline={discipline as Discipline} />
              <span>({docs.length})</span>
            </h3>
            <div className="space-y-2">
              {docs.map(doc => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentCardProps {
  document: ClinicalDocument;
}

function DocumentCard({ document }: DocumentCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-medium text-gray-900 truncate">
              {document.documentTypeLabel}
            </h4>
            <DisciplineBadge discipline={document.discipline} />
            <DocumentStatusBadge status={document.status} size="sm" />
            <SignatureStatusBadge status={document.signatureStatus} />
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{new Date(document.visitDate).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="truncate">
                {document.clinicianName}, {document.clinicianCredentials}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                {new Date(document.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {document.canView && (
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          )}
          
          {document.canEdit && (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          
          {document.canSign && (
            <Button size="sm">
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
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {document.canEdit && (
                <DropdownMenuItem>
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
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'amber' | 'purple' | 'red' | 'green';
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className={cn('p-4 rounded-lg border', colorClasses[color])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">{label}</span>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function DisciplineBadge({ discipline }: { discipline: Discipline }) {
  const config = {
    SN: { label: 'SN', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    PT: { label: 'PT', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    OT: { label: 'OT', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    ST: { label: 'ST', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    HHA: { label: 'HHA', color: 'bg-green-100 text-green-700 border-green-300' },
    MSW: { label: 'MSW', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    MD: { label: 'MD', color: 'bg-red-100 text-red-700 border-red-300' },
    RN: { label: 'RN', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    PTA: { label: 'PTA', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    COTA: { label: 'COTA', color: 'bg-pink-100 text-pink-700 border-pink-300' },
  };

  const { label, color } = config[discipline] || config.SN;

  return (
    <Badge className={cn('text-xs font-medium border', color)}>
      {label}
    </Badge>
  );
}

function SignatureStatusBadge({ status }: { status: SignatureStatus }) {
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

function DisciplineFilter({ 
  selected, 
  onChange 
}: { 
  selected: Discipline[]; 
  onChange: (disciplines: Discipline[]) => void;
}) {
  const disciplines: Discipline[] = ['SN', 'PT', 'OT', 'ST', 'HHA', 'MSW', 'MD'];

  return (
    <Select
      value={selected.length === 0 ? 'all' : selected[0]}
      onValueChange={(v) => {
        if (v === 'all') {
          onChange([]);
        } else {
          onChange([v as Discipline]);
        }
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="All Disciplines" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Disciplines</SelectItem>
        {disciplines.map(d => (
          <SelectItem key={d} value={d}>{d}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function StatusFilter({ 
  selected, 
  onChange 
}: { 
  selected: DocumentStatus[]; 
  onChange: (statuses: DocumentStatus[]) => void;
}) {
  const statuses: DocumentStatus[] = [
    'draft',
    'in_progress',
    'completed',
    'returned_for_correction',
    'approved',
    'signed',
  ];

  return (
    <Select
      value={selected.length === 0 ? 'all' : selected[0]}
      onValueChange={(v) => {
        if (v === 'all') {
          onChange([]);
        } else {
          onChange([v as DocumentStatus]);
        }
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="All Statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        {statuses.map(s => (
          <SelectItem key={s} value={s}>
            {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="p-12">
      <div className="text-center text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {message}
        </h3>
        <p className="text-sm">
          No documents match your current filters
        </p>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATE DOCUMENT DIALOG
// ═══════════════════════════════════════════════════════════════════════════

interface CreateDocumentDialogProps {
  onSelect: (category: DocumentCategory, documentType: string) => void;
  onCancel: () => void;
}

function CreateDocumentDialog({ onSelect, onCancel }: CreateDocumentDialogProps) {
  const documentTypes = {
    visit_documentation: [
      { value: 'sn_visit_note', label: 'SN Visit Note', discipline: 'SN' },
      { value: 'pt_visit_note', label: 'PT Visit Note', discipline: 'PT' },
      { value: 'ot_visit_note', label: 'OT Visit Note', discipline: 'OT' },
      { value: 'st_visit_note', label: 'ST Visit Note', discipline: 'ST' },
      { value: 'hha_visit_note', label: 'HHA Visit Note', discipline: 'HHA' },
      { value: 'msw_visit_note', label: 'MSW Visit Note', discipline: 'MSW' },
    ],
    assessments: [
      { value: 'oasis_e_soc', label: 'OASIS-E Start of Care', discipline: 'SN' },
      { value: 'oasis_e_roc', label: 'OASIS-E Resumption of Care', discipline: 'SN' },
      { value: 'oasis_e_follow_up', label: 'OASIS-E Follow-Up', discipline: 'SN' },
      { value: 'oasis_e_discharge', label: 'OASIS-E Discharge', discipline: 'SN' },
      { value: 'pt_evaluation', label: 'PT Evaluation', discipline: 'PT' },
      { value: 'ot_evaluation', label: 'OT Evaluation', discipline: 'OT' },
      { value: 'st_evaluation', label: 'ST Evaluation', discipline: 'ST' },
    ],
    orders: [
      { value: 'physician_order', label: 'Physician Order', discipline: 'MD' },
      { value: 'verbal_order', label: 'Verbal Order', discipline: 'SN' },
      { value: 'care_plan_update', label: 'Care Plan Update', discipline: 'SN' },
    ],
    plans_of_care: [
      { value: 'plan_of_care', label: 'Plan of Care (485)', discipline: 'SN' },
      { value: 'plan_of_care_update', label: 'Plan of Care Update', discipline: 'SN' },
    ],
  };

  return (
    <Tabs defaultValue="visit_documentation" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="visit_documentation">Visit Notes</TabsTrigger>
        <TabsTrigger value="assessments">Assessments</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="plans_of_care">Plans of Care</TabsTrigger>
      </TabsList>

      {Object.entries(documentTypes).map(([category, types]) => (
        <TabsContent key={category} value={category} className="space-y-2 mt-4">
          {types.map(type => (
            <button
              key={type.value}
              onClick={() => onSelect(category as DocumentCategory, type.value)}
              className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-gray-900">{type.label}</div>
                <div className="text-sm text-gray-600">Discipline: {type.discipline}</div>
              </div>
              <Plus className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}
