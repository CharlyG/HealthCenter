/**
 * Physical Therapy Clinical Module
 * 
 * Main module for PT clinical documentation supporting:
 * - PT Evaluation
 * - PT Visit Note
 * - PT Progress Note
 * - PT Discharge Summary
 * 
 * Integrated with the clinical documentation architecture.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Activity,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  FileText,
  ArrowLeft,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface PTDocument {
  id: string;
  type: 'evaluation' | 'visit_note' | 'progress_note' | 'discharge';
  patientId: string;
  patientName: string;
  admissionId: string;
  documentDate: string;
  status: 'in_progress' | 'completed' | 'signed';
  createdBy: string;
  lastModified: string;
}

// Mock data for demonstration
const MOCK_DOCUMENTS: PTDocument[] = [
  {
    id: 'pt-doc-001',
    type: 'evaluation',
    patientId: 'pat-123',
    patientName: 'Margaret Thompson',
    admissionId: 'adm-456',
    documentDate: '2026-03-01',
    status: 'signed',
    createdBy: 'Alex Chen, PT, DPT',
    lastModified: '2026-03-01T16:30:00Z'
  },
  {
    id: 'pt-doc-002',
    type: 'visit_note',
    patientId: 'pat-123',
    patientName: 'Margaret Thompson',
    admissionId: 'adm-456',
    documentDate: '2026-03-04',
    status: 'signed',
    createdBy: 'Alex Chen, PT, DPT',
    lastModified: '2026-03-04T11:15:00Z'
  },
  {
    id: 'pt-doc-003',
    type: 'visit_note',
    patientId: 'pat-123',
    patientName: 'Margaret Thompson',
    admissionId: 'adm-456',
    documentDate: '2026-03-07',
    status: 'in_progress',
    createdBy: 'Alex Chen, PT, DPT',
    lastModified: '2026-03-07T10:22:00Z'
  },
  {
    id: 'pt-doc-004',
    type: 'evaluation',
    patientId: 'pat-789',
    patientName: 'Robert Martinez',
    admissionId: 'adm-890',
    documentDate: '2026-03-05',
    status: 'signed',
    createdBy: 'Sarah Kim, PT, DPT',
    lastModified: '2026-03-05T14:45:00Z'
  },
  {
    id: 'pt-doc-005',
    type: 'progress_note',
    patientId: 'pat-789',
    patientName: 'Robert Martinez',
    admissionId: 'adm-890',
    documentDate: '2026-03-09',
    status: 'completed',
    createdBy: 'Sarah Kim, PT, DPT',
    lastModified: '2026-03-09T09:30:00Z'
  },
];

export default function PhysicalTherapyModule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const handleCreateNew = (type: 'evaluation' | 'visit_note' | 'progress_note' | 'discharge') => {
    // In production, this would navigate to patient selection, then create document
    navigate(`/pt/create?type=${type}`);
  };

  const handleOpenDocument = (docId: string) => {
    // In production, this would navigate to the document editor
    navigate(`/pt/document/${docId}`);
  };

  // Filter documents
  const filteredDocuments = MOCK_DOCUMENTS.filter(doc => {
    const matchesSearch = doc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Physical Therapy
                </h1>
              </div>
              <p className="text-gray-600">
                Clinical documentation for physical therapy services
              </p>
            </div>

            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Quick Create Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DocumentTypeCard
            icon={<ClipboardList className="w-8 h-8 text-purple-600" />}
            title="PT Evaluation"
            description="Initial assessment for new admissions"
            estimatedTime="90 min"
            onClick={() => handleCreateNew('evaluation')}
          />

          <DocumentTypeCard
            icon={<FileText className="w-8 h-8 text-blue-600" />}
            title="PT Visit Note"
            description="Routine visit documentation"
            estimatedTime="30 min"
            onClick={() => handleCreateNew('visit_note')}
          />

          <DocumentTypeCard
            icon={<TrendingUp className="w-8 h-8 text-green-600" />}
            title="PT Progress Note"
            description="Periodic progress assessment"
            estimatedTime="45 min"
            onClick={() => handleCreateNew('progress_note')}
          />

          <DocumentTypeCard
            icon={<CheckCircle className="w-8 h-8 text-teal-600" />}
            title="PT Discharge"
            description="Final discharge documentation"
            estimatedTime="60 min"
            onClick={() => handleCreateNew('discharge')}
          />
        </div>

        {/* Documents List */}
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent PT Documents
            </h2>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by patient name or document ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="evaluation">Evaluation</SelectItem>
                  <SelectItem value="visit_note">Visit Note</SelectItem>
                  <SelectItem value="progress_note">Progress Note</SelectItem>
                  <SelectItem value="discharge">Discharge</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Documents Table */}
          <div className="space-y-2">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No documents found</p>
              </div>
            ) : (
              filteredDocuments.map(doc => (
                <DocumentRow
                  key={doc.id}
                  document={doc}
                  onClick={() => handleOpenDocument(doc.id)}
                />
              ))
            )}
          </div>
        </Card>

        {/* Info Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Physical Therapy Documentation Requirements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Documents</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span><strong>PT Evaluation:</strong> Required at start of care within 5 days of admission</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span><strong>Visit Notes:</strong> Required for each visit documenting skilled interventions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span><strong>Progress Notes:</strong> Required every 30 days to reassess goals and progress</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <span><strong>Discharge Summary:</strong> Required at discharge to document outcomes</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Key Elements</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span>Skilled services justification</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span>Objective measurements (ROM, strength, gait)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span>Functional goals and progress tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span>Patient/caregiver education</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                  <span>Safety assessment and fall risk</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper Components

interface DocumentTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  estimatedTime: string;
  onClick: () => void;
}

function DocumentTypeCard({ icon, title, description, estimatedTime, onClick }: DocumentTypeCardProps) {
  return (
    <button
      onClick={onClick}
      className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-700">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        {description}
      </p>
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          ~{estimatedTime}
        </Badge>
        <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
      </div>
    </button>
  );
}

interface DocumentRowProps {
  document: PTDocument;
  onClick: () => void;
}

function DocumentRow({ document, onClick }: DocumentRowProps) {
  const getTypeConfig = (type: string) => {
    const configs = {
      evaluation: { label: 'PT Evaluation', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      visit_note: { label: 'Visit Note', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      progress_note: { label: 'Progress Note', color: 'bg-green-100 text-green-700 border-green-200' },
      discharge: { label: 'Discharge', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    };
    return configs[type as keyof typeof configs];
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      signed: { label: 'Signed', color: 'bg-green-100 text-green-700 border-green-200' },
    };
    return configs[status as keyof typeof configs];
  };

  const typeConfig = getTypeConfig(document.type);
  const statusConfig = getStatusConfig(document.status);

  return (
    <button
      onClick={onClick}
      className="w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={typeConfig.color}>
              {typeConfig.label}
            </Badge>
            <Badge variant="outline" className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-1">
            {document.patientName}
          </h4>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>ID: {document.id}</span>
            <span>•</span>
            <span>Date: {new Date(document.documentDate).toLocaleDateString()}</span>
            <span>•</span>
            <span>By: {document.createdBy}</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-gray-500 mb-1">
            Last modified
          </div>
          <div className="text-sm font-medium text-gray-700">
            {new Date(document.lastModified).toLocaleDateString()}
          </div>
        </div>
      </div>
    </button>
  );
}
