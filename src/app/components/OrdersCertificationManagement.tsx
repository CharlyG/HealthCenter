/**
 * Orders and Certification Management Component
 * 
 * Central workspace for managing all orders and certification documents
 * within a patient admission. Provides comprehensive tracking, filtering,
 * and workflow management.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  FileText,
  Phone,
  ClipboardList,
  RefreshCw,
  CheckCircle,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  ChevronRight,
  Edit,
  Eye,
  Send,
  CheckSquare,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  type OrderCertificationDocument,
  type DocumentCategory,
  type DocumentStatus,
  DOCUMENT_CATEGORY_CONFIG,
  STATUS_CONFIG,
  getDocumentsByAdmission,
  getDocumentsByCategory,
  getPendingSignatures,
  getExpiringDocuments,
  calculateExpirationWarning,
} from '../services/ordersAndCertification';

// ═══════════════════════════════════════════════════════════════════════════
// ICON MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_ICONS: Record<DocumentCategory, any> = {
  'physician-order': FileText,
  'verbal-order': Phone,
  'plan-of-care': ClipboardList,
  'recertification': RefreshCw,
  'discharge-certification': CheckCircle,
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface OrdersCertificationManagementProps {
  admissionId: string;
  patientName?: string;
  onDocumentClick?: (documentId: string) => void;
  onCreateDocument?: (category: DocumentCategory) => void;
}

export default function OrdersCertificationManagement({
  admissionId,
  patientName = 'Margaret Johnson',
  onDocumentClick,
  onCreateDocument,
}: OrdersCertificationManagementProps) {
  const [documents] = useState<OrderCertificationDocument[]>(
    getDocumentsByAdmission(admissionId)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (selectedCategory !== 'all') {
      filtered = getDocumentsByCategory(filtered, selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === selectedStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc =>
          doc.orderingPhysician.name.toLowerCase().includes(term) ||
          doc.id.toLowerCase().includes(term) ||
          DOCUMENT_CATEGORY_CONFIG[doc.category].label.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [documents, selectedCategory, selectedStatus, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: documents.length,
      pendingSignature: getPendingSignatures(documents).length,
      expiring: getExpiringDocuments(documents, 14).length,
      active: documents.filter(d => d.status === 'active').length,
    };
  }, [documents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders & Certification</h2>
          <p className="text-sm text-gray-600 mt-1">
            {patientName} • Admission #{admissionId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
          <CreateDocumentDropdown onSelect={onCreateDocument} />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Documents"
          value={stats.total}
          icon={FileText}
          color="#3B82F6"
        />
        <StatCard
          label="Pending Signature"
          value={stats.pendingSignature}
          icon={AlertCircle}
          color="#F59E0B"
          alert={stats.pendingSignature > 0}
        />
        <StatCard
          label="Expiring Soon"
          value={stats.expiring}
          icon={Clock}
          color="#EF4444"
          alert={stats.expiring > 0}
        />
        <StatCard
          label="Active Orders"
          value={stats.active}
          icon={CheckCircle}
          color="#10B981"
        />
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by document ID, physician, or type..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />
            <StatusFilter value={selectedStatus} onChange={setSelectedStatus} />
          </div>
        </div>
      </Card>

      {/* Document Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All Documents
            <Badge variant="secondary" className="ml-2">
              {documents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending-action">
            Pending Action
            <Badge variant="destructive" className="ml-2">
              {stats.pendingSignature + stats.expiring}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            <Badge variant="secondary" className="ml-2">
              {stats.active}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DocumentList
            documents={filteredDocuments}
            onDocumentClick={onDocumentClick}
          />
        </TabsContent>

        <TabsContent value="pending-action" className="mt-6">
          <DocumentList
            documents={[
              ...getPendingSignatures(filteredDocuments),
              ...getExpiringDocuments(filteredDocuments, 14),
            ]}
            onDocumentClick={onDocumentClick}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <DocumentList
            documents={filteredDocuments.filter(d => d.status === 'active')}
            onDocumentClick={onDocumentClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: number;
  icon: any;
  color: string;
  alert?: boolean;
}

function StatCard({ label, value, icon: Icon, color, alert }: StatCardProps) {
  return (
    <Card className={cn('p-4', alert && 'border-2 border-amber-300')}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY FILTER
// ═══════════════════════════════════════════════════════════════════════════

interface CategoryFilterProps {
  value: DocumentCategory | 'all';
  onChange: (value: DocumentCategory | 'all') => void;
}

function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={value === 'all' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('all')}
      >
        All
      </Button>
      {(Object.keys(DOCUMENT_CATEGORY_CONFIG) as DocumentCategory[]).map(category => {
        const config = DOCUMENT_CATEGORY_CONFIG[category];
        const Icon = CATEGORY_ICONS[category];
        return (
          <Button
            key={category}
            variant={value === category ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChange(category)}
            className="gap-1.5"
          >
            <Icon className="w-3.5 h-3.5" />
            {config.label.split(' ')[0]}
          </Button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS FILTER
// ═══════════════════════════════════════════════════════════════════════════

interface StatusFilterProps {
  value: DocumentStatus | 'all';
  onChange: (value: DocumentStatus | 'all') => void;
}

function StatusFilter({ value, onChange }: StatusFilterProps) {
  const statusOptions: Array<DocumentStatus | 'all'> = [
    'all',
    'active',
    'pending-signature',
    'draft',
    'expired',
  ];

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as DocumentStatus | 'all')}
      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {statusOptions.map(status => (
        <option key={status} value={status}>
          {status === 'all' ? 'All Status' : STATUS_CONFIG[status as DocumentStatus].label}
        </option>
      ))}
    </select>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATE DOCUMENT DROPDOWN
// ═══════════════════════════════════════════════════════════════════════════

interface CreateDocumentDropdownProps {
  onSelect?: (category: DocumentCategory) => void;
}

function CreateDocumentDropdown({ onSelect }: CreateDocumentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)}>
        <Plus className="w-4 h-4 mr-2" />
        Create Document
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-2">
            <p className="text-xs font-semibold text-gray-500 px-3 py-2">
              Select Document Type
            </p>
            {(Object.keys(DOCUMENT_CATEGORY_CONFIG) as DocumentCategory[]).map(category => {
              const config = DOCUMENT_CATEGORY_CONFIG[category];
              const Icon = CATEGORY_ICONS[category];
              return (
                <button
                  key={category}
                  onClick={() => {
                    onSelect?.(category);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{config.label}</p>
                    <p className="text-xs text-gray-600">{config.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT LIST
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentListProps {
  documents: OrderCertificationDocument[];
  onDocumentClick?: (documentId: string) => void;
}

function DocumentList({ documents, onDocumentClick }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h4 className="font-semibold text-gray-900 mb-1">No Documents Found</h4>
          <p className="text-sm text-gray-600">
            No documents match your current filters
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map(doc => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onClick={() => onDocumentClick?.(doc.id)}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentCardProps {
  document: OrderCertificationDocument;
  onClick?: () => void;
}

function DocumentCard({ document, onClick }: DocumentCardProps) {
  const categoryConfig = DOCUMENT_CATEGORY_CONFIG[document.category];
  const statusConfig = STATUS_CONFIG[document.status];
  const Icon = CATEGORY_ICONS[document.category];

  const expirationInfo = document.expirationDate
    ? calculateExpirationWarning(document.expirationDate)
    : null;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${categoryConfig.color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: categoryConfig.color }} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{categoryConfig.label}</h4>
              <p className="text-sm text-gray-600">Document #{document.id}</p>
            </div>
            <Badge
              style={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Ordering Physician</p>
                <p className="text-sm font-medium text-gray-900">
                  {document.orderingPhysician.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Order Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(document.orderDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Effective Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(document.effectiveDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="flex items-center gap-2 mb-3">
            {/* Signature Alert */}
            {document.signatureStatus !== 'fully-signed' &&
              document.signatureStatus !== 'not-required' && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending Signature
                </Badge>
              )}

            {/* Expiration Alert */}
            {expirationInfo?.warningLevel && (
              <Badge
                variant="outline"
                className={cn(
                  expirationInfo.warningLevel === 'critical' &&
                    'bg-red-50 text-red-700 border-red-300',
                  expirationInfo.warningLevel === 'warning' &&
                    'bg-amber-50 text-amber-700 border-amber-300',
                  expirationInfo.warningLevel === 'info' &&
                    'bg-blue-50 text-blue-700 border-blue-300'
                )}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Expires in {expirationInfo.daysUntil} days
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1.5" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
            {document.signatureStatus !== 'fully-signed' && (
              <Button variant="default" size="sm">
                <Send className="w-4 h-4 mr-1.5" />
                Send for Signature
              </Button>
            )}
            <Button variant="ghost" size="sm" className="ml-auto">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
