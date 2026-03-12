/**
 * Patient Clinical Documentation Section - Admission-Based
 * 
 * Displays clinical documentation grouped by type and filtered by admission:
 * - Visit Notes
 * - Plans of Care
 * - Verbal Orders
 * - Assessments
 * - Other Clinical Forms
 * 
 * Features:
 * - Automatic filtering by selected admission
 * - Optional toggle to view all admissions
 * - Document type, visit date, caregiver, status, signature status
 * - Auto-association of new documents with active admission
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileText,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  Plus,
  Loader2,
  FolderOpen,
  ClipboardList,
  ScrollText,
  Pill,
  Stethoscope,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { clinicalGateway } from '../../../lib/dataGateway';
import NoAdmissionSelected from './NoAdmissionSelected';

interface PatientClinicalDocumentationProps {
  patientId: string;
  admissionId?: string;
}

// Document types
type DocumentType = 'visit_notes' | 'plans_of_care' | 'verbal_orders' | 'assessments' | 'other';

interface ClinicalDocument {
  id: string;
  type: DocumentType;
  title: string;
  visitDate?: string;
  createdDate: string;
  caregiver?: string;
  caregiverName?: string;
  status: 'draft' | 'pending_review' | 'pending_signature' | 'completed' | 'cancelled';
  signatureStatus: 'unsigned' | 'partially_signed' | 'fully_signed';
  admissionId?: string;
  discipline?: string;
  description?: string;
}

// Mock data generator
function generateMockDocuments(patientId: string, admissionId?: string): ClinicalDocument[] {
  const docs: ClinicalDocument[] = [];
  const now = new Date();

  // Visit Notes
  for (let i = 0; i < 8; i++) {
    docs.push({
      id: `vn-${i}`,
      type: 'visit_notes',
      title: `Visit Note - ${i === 0 ? 'Today' : `${i} days ago`}`,
      visitDate: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
      caregiverName: ['Sarah Johnson, RN', 'Mike Chen, PT', 'Lisa Davis, OT', 'John Smith, RN'][i % 4],
      discipline: ['Nursing', 'Physical Therapy', 'Occupational Therapy', 'Nursing'][i % 4],
      status: i === 0 ? 'draft' : i === 1 ? 'pending_signature' : 'completed',
      signatureStatus: i === 0 ? 'unsigned' : i === 1 ? 'partially_signed' : 'fully_signed',
      admissionId: i < 6 ? admissionId : 'previous-admission-' + i,
    });
  }

  // Plans of Care
  for (let i = 0; i < 3; i++) {
    docs.push({
      id: `poc-${i}`,
      type: 'plans_of_care',
      title: ['Initial Plan of Care', 'Recertification POC', 'Revised POC'][i],
      visitDate: new Date(now.getTime() - (i * 30) * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(now.getTime() - (i * 30) * 24 * 60 * 60 * 1000).toISOString(),
      caregiverName: 'Dr. Williams',
      status: i === 0 ? 'pending_signature' : 'completed',
      signatureStatus: i === 0 ? 'partially_signed' : 'fully_signed',
      admissionId: i < 2 ? admissionId : 'previous-admission-poc',
    });
  }

  // Verbal Orders
  for (let i = 0; i < 5; i++) {
    docs.push({
      id: `vo-${i}`,
      type: 'verbal_orders',
      title: ['Lisinopril 10mg PO daily', 'Furosemide 20mg PO BID', 'Insulin Sliding Scale', 'Wound Care Protocol', 'PT Evaluation'][i],
      visitDate: new Date(now.getTime() - (i * 7) * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(now.getTime() - (i * 7) * 24 * 60 * 60 * 1000).toISOString(),
      caregiverName: 'Dr. Anderson',
      status: i < 2 ? 'pending_signature' : 'completed',
      signatureStatus: i < 2 ? 'unsigned' : 'fully_signed',
      admissionId: i < 4 ? admissionId : 'previous-admission-vo',
    });
  }

  // Assessments
  for (let i = 0; i < 4; i++) {
    docs.push({
      id: `asmt-${i}`,
      type: 'assessments',
      title: ['OASIS Start of Care', 'Nursing Assessment', 'PT Evaluation', 'OASIS Recert'][i],
      visitDate: new Date(now.getTime() - (i * 15) * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(now.getTime() - (i * 15) * 24 * 60 * 60 * 1000).toISOString(),
      caregiverName: ['Sarah Johnson, RN', 'Mike Chen, PT', 'Lisa Davis, OT', 'Sarah Johnson, RN'][i],
      discipline: ['Nursing', 'Physical Therapy', 'Occupational Therapy', 'Nursing'][i],
      status: i === 0 ? 'pending_review' : 'completed',
      signatureStatus: i === 0 ? 'unsigned' : 'fully_signed',
      admissionId: i < 3 ? admissionId : 'previous-admission-asmt',
    });
  }

  // Other
  for (let i = 0; i < 2; i++) {
    docs.push({
      id: `other-${i}`,
      type: 'other',
      title: ['Discharge Summary', 'Hospitalization Note'][i],
      visitDate: new Date(now.getTime() - (i * 20) * 24 * 60 * 60 * 1000).toISOString(),
      createdDate: new Date(now.getTime() - (i * 20) * 24 * 60 * 60 * 1000).toISOString(),
      caregiverName: 'Sarah Johnson, RN',
      status: 'completed',
      signatureStatus: 'fully_signed',
      admissionId: i === 0 ? admissionId : 'previous-admission-other',
    });
  }

  return docs;
}

const DOCUMENT_TYPE_CONFIG = {
  visit_notes: {
    label: 'Visit Notes',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  plans_of_care: {
    label: 'Plans of Care',
    icon: ClipboardList,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  verbal_orders: {
    label: 'Verbal Orders',
    icon: Pill,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  assessments: {
    label: 'Assessments',
    icon: Stethoscope,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  other: {
    label: 'Other Clinical Forms',
    icon: ScrollText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

export default function PatientClinicalDocumentation({ patientId, admissionId }: PatientClinicalDocumentationProps) {
  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllAdmissions, setShowAllAdmissions] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentType>('visit_notes');

  // Load documents
  useEffect(() => {
    if (!admissionId && !showAllAdmissions) {
      setLoading(false);
      return;
    }

    const loadDocuments = async () => {
      setLoading(true);
      try {
        // TODO: Replace with real API call
        // const result = await clinicalGateway.getDocuments(patientId, admissionId);
        
        // Using mock data for now
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockDocs = generateMockDocuments(patientId, admissionId);
        setDocuments(mockDocs);
      } catch (err) {
        console.error('[PatientClinicalDocumentation] Load error:', err);
        toast.error('Failed to load clinical documentation');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [patientId, admissionId, showAllAdmissions]);

  // Filter documents by admission
  const filteredDocuments = useMemo(() => {
    if (showAllAdmissions || !admissionId) {
      return documents;
    }
    return documents.filter(doc => doc.admissionId === admissionId);
  }, [documents, admissionId, showAllAdmissions]);

  // Group documents by type
  const groupedDocuments = useMemo(() => {
    const groups: Record<DocumentType, ClinicalDocument[]> = {
      visit_notes: [],
      plans_of_care: [],
      verbal_orders: [],
      assessments: [],
      other: [],
    };

    filteredDocuments.forEach(doc => {
      groups[doc.type].push(doc);
    });

    // Sort each group by date (newest first)
    Object.keys(groups).forEach(type => {
      groups[type as DocumentType].sort((a, b) => 
        new Date(b.visitDate || b.createdDate).getTime() - new Date(a.visitDate || a.createdDate).getTime()
      );
    });

    return groups;
  }, [filteredDocuments]);

  // Calculate stats for each type
  const typeStats = useMemo(() => {
    const stats: Record<DocumentType, { total: number; pending: number; unsigned: number }> = {
      visit_notes: { total: 0, pending: 0, unsigned: 0 },
      plans_of_care: { total: 0, pending: 0, unsigned: 0 },
      verbal_orders: { total: 0, pending: 0, unsigned: 0 },
      assessments: { total: 0, pending: 0, unsigned: 0 },
      other: { total: 0, pending: 0, unsigned: 0 },
    };

    Object.entries(groupedDocuments).forEach(([type, docs]) => {
      const t = type as DocumentType;
      stats[t].total = docs.length;
      stats[t].pending = docs.filter(d => d.status === 'pending_review' || d.status === 'pending_signature').length;
      stats[t].unsigned = docs.filter(d => d.signatureStatus !== 'fully_signed').length;
    });

    return stats;
  }, [groupedDocuments]);

  // Show prompt if no admission selected
  if (!admissionId && !showAllAdmissions) {
    return (
      <NoAdmissionSelected 
        message="Select an admission to view its clinical documentation"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading clinical documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="size-6 text-gray-600" />
            Clinical Documentation
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Documentation for the selected admission
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Admission filter toggle */}
          {admissionId && (
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border">
              <Filter className="size-4 text-gray-600" />
              <Label htmlFor="show-all" className="text-sm cursor-pointer">
                Show all admissions
              </Label>
              <Switch
                id="show-all"
                checked={showAllAdmissions}
                onCheckedChange={setShowAllAdmissions}
              />
            </div>
          )}
          <Button size="sm">
            <Plus className="size-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(DOCUMENT_TYPE_CONFIG).map(([type, config]) => {
          const stats = typeStats[type as DocumentType];
          const Icon = config.icon;
          
          return (
            <Card 
              key={type}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeTab === type ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setActiveTab(type as DocumentType)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`size-4 ${config.color}`} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
                </div>
                <p className="text-xs font-medium text-gray-700 mb-1">{config.label}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  {stats.pending > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-600">
                      <Clock className="size-3" />
                      {stats.pending} pending
                    </span>
                  )}
                  {stats.unsigned > 0 && (
                    <span className="flex items-center gap-0.5 text-red-600">
                      <AlertTriangle className="size-3" />
                      {stats.unsigned} unsigned
                    </span>
                  )}
                  {stats.pending === 0 && stats.unsigned === 0 && stats.total > 0 && (
                    <span className="text-green-600">All complete</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs for document types */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DocumentType)}>
        <TabsList className="w-full grid grid-cols-5">
          {Object.entries(DOCUMENT_TYPE_CONFIG).map(([type, config]) => (
            <TabsTrigger key={type} value={type} className="text-xs">
              {config.label}
              {typeStats[type as DocumentType].total > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px]">
                  {typeStats[type as DocumentType].total}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(DOCUMENT_TYPE_CONFIG).map(([type, config]) => (
          <TabsContent key={type} value={type} className="space-y-3">
            <DocumentList
              documents={groupedDocuments[type as DocumentType]}
              type={type as DocumentType}
              config={config}
              showAdmissionTag={showAllAdmissions}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Document List Component
interface DocumentListProps {
  documents: ClinicalDocument[];
  type: DocumentType;
  config: typeof DOCUMENT_TYPE_CONFIG[DocumentType];
  showAdmissionTag: boolean;
}

function DocumentList({ documents, type, config, showAdmissionTag }: DocumentListProps) {
  const Icon = config.icon;

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <div className={`${config.bgColor} rounded-full p-4 inline-flex`}>
              <Icon className={`size-8 ${config.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">No {config.label.toLowerCase()}</p>
              <p className="text-xs text-gray-600 mt-1">
                Create your first document for this admission
              </p>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="size-4 mr-2" />
              Create {config.label.slice(0, -1)}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map(doc => (
        <DocumentCard 
          key={doc.id} 
          document={doc} 
          config={config}
          showAdmissionTag={showAdmissionTag}
        />
      ))}
    </div>
  );
}

// Document Card Component
interface DocumentCardProps {
  document: ClinicalDocument;
  config: typeof DOCUMENT_TYPE_CONFIG[DocumentType];
  showAdmissionTag: boolean;
}

function DocumentCard({ document, config, showAdmissionTag }: DocumentCardProps) {
  const Icon = config.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending_signature':
        return 'bg-amber-100 text-amber-800';
      case 'pending_review':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignatureIcon = (status: string) => {
    switch (status) {
      case 'fully_signed':
        return <CheckCircle2 className="size-3.5 text-green-600" />;
      case 'partially_signed':
        return <AlertTriangle className="size-3.5 text-amber-600" />;
      case 'unsigned':
        return <Clock className="size-3.5 text-gray-400" />;
      default:
        return <Clock className="size-3.5 text-gray-400" />;
    }
  };

  const getSignatureText = (status: string) => {
    switch (status) {
      case 'fully_signed':
        return 'Fully Signed';
      case 'partially_signed':
        return 'Partially Signed';
      case 'unsigned':
        return 'Unsigned';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`${config.bgColor} p-2.5 rounded-lg flex-shrink-0`}>
            <Icon className={`size-5 ${config.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{document.title}</h4>
                {document.discipline && (
                  <p className="text-xs text-gray-600 mt-0.5">{document.discipline}</p>
                )}
              </div>
              <Badge className={`${getStatusColor(document.status)} text-xs ml-2 flex-shrink-0`}>
                {document.status.replace('_', ' ')}
              </Badge>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-3 gap-4 text-xs mb-2">
              {/* Visit Date */}
              {document.visitDate && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="size-3.5" />
                  <div>
                    <p className="text-[10px] text-gray-500">Visit Date</p>
                    <p className="font-medium">
                      {new Date(document.visitDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Caregiver */}
              {document.caregiverName && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <User className="size-3.5" />
                  <div>
                    <p className="text-[10px] text-gray-500">Caregiver</p>
                    <p className="font-medium">{document.caregiverName}</p>
                  </div>
                </div>
              )}

              {/* Signature Status */}
              <div className="flex items-center gap-1.5 text-gray-600">
                {getSignatureIcon(document.signatureStatus)}
                <div>
                  <p className="text-[10px] text-gray-500">Signature</p>
                  <p className="font-medium">{getSignatureText(document.signatureStatus)}</p>
                </div>
              </div>
            </div>

            {/* Footer tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {showAdmissionTag && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                  <FolderOpen className="size-3 mr-1" />
                  {document.admissionId?.startsWith('previous') ? 'Previous Admission' : 'Current Admission'}
                </Badge>
              )}
              <span className="text-[10px] text-gray-400">
                Created {new Date(document.createdDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action button */}
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
