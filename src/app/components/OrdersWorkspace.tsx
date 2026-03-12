/**
 * Orders Workspace Component
 * 
 * Comprehensive workspace for managing all order-related documents within
 * an active patient admission. Organizes documents by category with advanced
 * filtering and direct actions.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  FileText,
  Phone,
  ClipboardList,
  RefreshCw,
  CheckCircle,
  Search,
  Filter,
  Download,
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  AlertCircle,
  Clock,
  Edit,
  Eye,
  Send,
  RotateCcw,
  CheckSquare,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  type OrderCertificationDocument,
  type DocumentCategory,
  type DocumentStatus,
  type SignatureStatus,
  getDocumentsByAdmission,
  DOCUMENT_CATEGORY_CONFIG,
  STATUS_CONFIG,
  calculateExpirationWarning,
} from '../services/ordersAndCertification';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type WorkspaceCategory =
  | 'pending-orders'
  | 'signed-orders'
  | 'returned-orders'
  | 'expired-orders'
  | 'verbal-orders'
  | 'plan-of-care'
  | 'recertification';

interface OrderFilters {
  documentType: DocumentCategory | 'all';
  status: DocumentStatus | 'all';
  physician: string;
  signatureStatus: SignatureStatus | 'all';
  dateRange: {
    start: string;
    end: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface OrdersWorkspaceProps {
  admissionId: string;
  patientName?: string;
  onDocumentOpen?: (documentId: string) => void;
  onDocumentEdit?: (documentId: string) => void;
  onDocumentSign?: (documentId: string) => void;
  onDocumentReturn?: (documentId: string) => void;
  onCreateOrder?: () => void;
}

export default function OrdersWorkspace({
  admissionId,
  patientName = 'Margaret Johnson',
  onDocumentOpen,
  onDocumentEdit,
  onDocumentSign,
  onDocumentReturn,
  onCreateOrder,
}: OrdersWorkspaceProps) {
  const [documents] = useState<OrderCertificationDocument[]>(
    getDocumentsByAdmission(admissionId)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<WorkspaceCategory>>(
    new Set(['pending-orders', 'verbal-orders'])
  );
  const [filters, setFilters] = useState<OrderFilters>({
    documentType: 'all',
    status: 'all',
    physician: '',
    signatureStatus: 'all',
    dateRange: { start: '', end: '' },
  });

  // Group documents by workspace category
  const groupedDocuments = useMemo(() => {
    let filtered = documents;

    // Apply filters
    if (filters.documentType !== 'all') {
      filtered = filtered.filter(doc => doc.category === filters.documentType);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }
    if (filters.physician) {
      filtered = filtered.filter(doc =>
        doc.orderingPhysician.name.toLowerCase().includes(filters.physician.toLowerCase())
      );
    }
    if (filters.signatureStatus !== 'all') {
      filtered = filtered.filter(doc => doc.signatureStatus === filters.signatureStatus);
    }
    if (filters.dateRange.start) {
      filtered = filtered.filter(
        doc => new Date(doc.orderDate) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(
        doc => new Date(doc.orderDate) <= new Date(filters.dateRange.end)
      );
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc =>
          doc.id.toLowerCase().includes(term) ||
          doc.orderingPhysician.name.toLowerCase().includes(term) ||
          doc.createdBy.name.toLowerCase().includes(term) ||
          DOCUMENT_CATEGORY_CONFIG[doc.category].label.toLowerCase().includes(term)
      );
    }

    // Group by category
    return {
      'pending-orders': filtered.filter(
        doc =>
          doc.status === 'draft' ||
          doc.status === 'pending-review' ||
          doc.status === 'pending-signature'
      ),
      'signed-orders': filtered.filter(
        doc => doc.status === 'signed' || doc.status === 'active'
      ),
      'returned-orders': filtered.filter(doc => doc.status === 'cancelled'),
      'expired-orders': filtered.filter(doc => doc.status === 'expired'),
      'verbal-orders': filtered.filter(doc => doc.category === 'verbal-order'),
      'plan-of-care': filtered.filter(doc => doc.category === 'plan-of-care'),
      'recertification': filtered.filter(doc => doc.category === 'recertification'),
    };
  }, [documents, filters, searchTerm]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    return {
      total: documents.length,
      pending: groupedDocuments['pending-orders'].length,
      needsSignature: documents.filter(
        doc =>
          doc.signatureStatus === 'pending-physician' ||
          doc.signatureStatus === 'pending-nurse' ||
          doc.signatureStatus === 'pending-both'
      ).length,
      expiringSoon: documents.filter(doc => {
        if (!doc.expirationDate) return false;
        const { warningLevel } = calculateExpirationWarning(doc.expirationDate);
        return warningLevel === 'critical' || warningLevel === 'warning';
      }).length,
    };
  }, [documents, groupedDocuments]);

  const toggleCategory = (category: WorkspaceCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Orders Workspace</h2>
              <p className="text-sm text-gray-600 mt-1">
                {patientName} • Admission #{admissionId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={onCreateOrder}>
                <Plus className="w-4 h-4 mr-2" />
                New Order
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <StatCard label="Total Orders" value={stats.total} icon={FileText} />
            <StatCard
              label="Pending"
              value={stats.pending}
              icon={Clock}
              alert={stats.pending > 0}
            />
            <StatCard
              label="Needs Signature"
              value={stats.needsSignature}
              icon={AlertCircle}
              alert={stats.needsSignature > 0}
            />
            <StatCard
              label="Expiring Soon"
              value={stats.expiringSoon}
              icon={TrendingUp}
              alert={stats.expiringSoon > 0}
            />
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders by ID, physician, or creator..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {Object.values(filters).some(v => v !== 'all' && v !== '') && (
                <Badge variant="destructive" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <OrderFiltersPanel filters={filters} onFiltersChange={setFilters} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {/* Pending Orders */}
          <OrderCategoryGroup
            title="Pending Orders"
            icon={Clock}
            color="#F59E0B"
            count={groupedDocuments['pending-orders'].length}
            isExpanded={expandedCategories.has('pending-orders')}
            onToggle={() => toggleCategory('pending-orders')}
            documents={groupedDocuments['pending-orders']}
            onDocumentOpen={onDocumentOpen}
            onDocumentEdit={onDocumentEdit}
            onDocumentSign={onDocumentSign}
            onDocumentReturn={onDocumentReturn}
          />

          {/* Signed Orders */}
          <OrderCategoryGroup
            title="Signed Orders"
            icon={CheckCircle}
            color="#10B981"
            count={groupedDocuments['signed-orders'].length}
            isExpanded={expandedCategories.has('signed-orders')}
            onToggle={() => toggleCategory('signed-orders')}
            documents={groupedDocuments['signed-orders']}
            onDocumentOpen={onDocumentOpen}
            onDocumentEdit={onDocumentEdit}
            onDocumentSign={onDocumentSign}
            onDocumentReturn={onDocumentReturn}
          />

          {/* Returned Orders */}
          <OrderCategoryGroup
            title="Returned Orders"
            icon={RotateCcw}
            color="#EF4444"
            count={groupedDocuments['returned-orders'].length}
            isExpanded={expandedCategories.has('returned-orders')}
            onToggle={() => toggleCategory('returned-orders')}
            documents={groupedDocuments['returned-orders']}
            onDocumentOpen={onDocumentOpen}
            onDocumentEdit={onDocumentEdit}
            onDocumentSign={onDocumentSign}
            onDocumentReturn={onDocumentReturn}
          />

          {/* Expired Orders */}
          <OrderCategoryGroup
            title="Expired Orders"
            icon={XCircle}
            color="#6B7280"
            count={groupedDocuments['expired-orders'].length}
            isExpanded={expandedCategories.has('expired-orders')}
            onToggle={() => toggleCategory('expired-orders')}
            documents={groupedDocuments['expired-orders']}
            onDocumentOpen={onDocumentOpen}
            onDocumentEdit={onDocumentEdit}
            onDocumentSign={onDocumentSign}
            onDocumentReturn={onDocumentReturn}
          />

          {/* Verbal Orders */}
          <OrderCategoryGroup
            title="Verbal Orders"
            icon={Phone}
            color="#F59E0B"
            count={groupedDocuments['verbal-orders'].length}
            isExpanded={expandedCategories.has('verbal-orders')}
            onToggle={() => toggleCategory('verbal-orders')}
            documents={groupedDocuments['verbal-orders']}
            onDocumentOpen={onDocumentOpen}
            onDocumentEdit={onDocumentEdit}
            onDocumentSign={onDocumentSign}
            onDocumentReturn={onDocumentReturn}
          />

          {/* Plan of Care / 485 */}
          <OrderCategoryGroup
            title="Plan of Care / 485"
            icon={ClipboardList}
            color="#10B981"
            count={groupedDocuments['plan-of-care'].length}
            isExpanded={expandedCategories.has('plan-of-care')}
            onToggle={() => toggleCategory('plan-of-care')}
            documents={groupedDocuments['plan-of-care']}
            onDocumentOpen={onDocumentOpen}
            onDocumentEdit={onDocumentEdit}
            onDocumentSign={onDocumentSign}
            onDocumentReturn={onDocumentReturn}
          />

          {/* Recertification Documents */}
          <OrderCategoryGroup
            title="Recertification Documents"
            icon={RefreshCw}
            color="#8B5CF6"
            count={groupedDocuments['recertification'].length}
            isExpanded={expandedCategories.has('recertification')}
            onToggle={() => toggleCategory('recertification')}
            documents={groupedDocuments['recertification']}
            onDocumentOpen={onDocumentOpen}
            onDocumentEdit={onDocumentEdit}
            onDocumentSign={onDocumentSign}
            onDocumentReturn={onDocumentReturn}
          />
        </div>
      </div>
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
  alert?: boolean;
}

function StatCard({ label, value, icon: Icon, alert }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 bg-gray-50 rounded-lg',
        alert && 'bg-amber-50 border border-amber-300'
      )}
    >
      <Icon className={cn('w-5 h-5', alert ? 'text-amber-600' : 'text-gray-400')} />
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className={cn('text-2xl font-bold', alert ? 'text-amber-900' : 'text-gray-900')}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER FILTERS PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface OrderFiltersPanelProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
}

function OrderFiltersPanel({ filters, onFiltersChange }: OrderFiltersPanelProps) {
  const updateFilter = (key: keyof OrderFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      documentType: 'all',
      status: 'all',
      physician: '',
      signatureStatus: 'all',
      dateRange: { start: '', end: '' },
    });
  };

  return (
    <Card className="mt-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear All
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {/* Document Type */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Document Type
          </label>
          <select
            value={filters.documentType}
            onChange={e =>
              updateFilter('documentType', e.target.value as DocumentCategory | 'all')
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {(Object.keys(DOCUMENT_CATEGORY_CONFIG) as DocumentCategory[]).map(type => (
              <option key={type} value={type}>
                {DOCUMENT_CATEGORY_CONFIG[type].label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
          <select
            value={filters.status}
            onChange={e => updateFilter('status', e.target.value as DocumentStatus | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            {(Object.keys(STATUS_CONFIG) as DocumentStatus[]).map(status => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </option>
            ))}
          </select>
        </div>

        {/* Signature Status */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Signature Status
          </label>
          <select
            value={filters.signatureStatus}
            onChange={e =>
              updateFilter('signatureStatus', e.target.value as SignatureStatus | 'all')
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="pending-physician">Pending Physician</option>
            <option value="pending-nurse">Pending Nurse</option>
            <option value="pending-both">Pending Both</option>
            <option value="partially-signed">Partially Signed</option>
            <option value="fully-signed">Fully Signed</option>
          </select>
        </div>

        {/* Physician */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Ordering Physician
          </label>
          <Input
            placeholder="Filter by physician name..."
            value={filters.physician}
            onChange={e => updateFilter('physician', e.target.value)}
          />
        </div>

        {/* Date Range Start */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Order Date From
          </label>
          <Input
            type="date"
            value={filters.dateRange.start}
            onChange={e =>
              updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })
            }
          />
        </div>

        {/* Date Range End */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Order Date To
          </label>
          <Input
            type="date"
            value={filters.dateRange.end}
            onChange={e =>
              updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })
            }
          />
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER CATEGORY GROUP
// ═══════════════════════════════════════════════════════════════════════════

interface OrderCategoryGroupProps {
  title: string;
  icon: any;
  color: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  documents: OrderCertificationDocument[];
  onDocumentOpen?: (documentId: string) => void;
  onDocumentEdit?: (documentId: string) => void;
  onDocumentSign?: (documentId: string) => void;
  onDocumentReturn?: (documentId: string) => void;
}

function OrderCategoryGroup({
  title,
  icon: Icon,
  color,
  count,
  isExpanded,
  onToggle,
  documents,
  onDocumentOpen,
  onDocumentEdit,
  onDocumentSign,
  onDocumentReturn,
}: OrderCategoryGroupProps) {
  return (
    <Card>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{count} document(s)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{count}</Badge>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t">
          {documents.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-600">No documents in this category</p>
            </div>
          ) : (
            <div className="divide-y">
              {documents.map(doc => (
                <OrderWorkspaceItem
                  key={doc.id}
                  document={doc}
                  onOpen={() => onDocumentOpen?.(doc.id)}
                  onEdit={() => onDocumentEdit?.(doc.id)}
                  onSign={() => onDocumentSign?.(doc.id)}
                  onReturn={() => onDocumentReturn?.(doc.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER WORKSPACE ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface OrderWorkspaceItemProps {
  document: OrderCertificationDocument;
  onOpen?: () => void;
  onEdit?: () => void;
  onSign?: () => void;
  onReturn?: () => void;
}

function OrderWorkspaceItem({
  document,
  onOpen,
  onEdit,
  onSign,
  onReturn,
}: OrderWorkspaceItemProps) {
  const categoryConfig = DOCUMENT_CATEGORY_CONFIG[document.category];
  const statusConfig = STATUS_CONFIG[document.status];
  const expirationInfo = document.expirationDate
    ? calculateExpirationWarning(document.expirationDate)
    : null;

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Left: Main Info */}
        <div className="flex-1 min-w-0">
          {/* Top Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  {categoryConfig.label}
                </h4>
                <Badge
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    color: statusConfig.color,
                  }}
                >
                  {statusConfig.label}
                </Badge>
                {document.signatureStatus !== 'fully-signed' &&
                  document.signatureStatus !== 'not-required' && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                      Pending Signature
                    </Badge>
                  )}
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
                    Expires in {expirationInfo.daysUntil}d
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">Document #{document.id}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Order Date</p>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <p className="font-medium text-gray-900">
                  {new Date(document.orderDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Effective Date</p>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <p className="font-medium text-gray-900">
                  {new Date(document.effectiveDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Ordering Physician</p>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <p className="font-medium text-gray-900">
                  {document.orderingPhysician.name}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Created By</p>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <p className="font-medium text-gray-900">{document.createdBy.name}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Signature Status</p>
              <p className="font-medium text-gray-900 capitalize">
                {document.signatureStatus.replace(/-/g, ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onOpen}>
            <Eye className="w-4 h-4 mr-1.5" />
            Open
          </Button>
          {document.status !== 'signed' && document.status !== 'active' && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
          )}
          {(document.signatureStatus === 'pending-physician' ||
            document.signatureStatus === 'pending-both') && (
            <Button variant="default" size="sm" onClick={onSign}>
              <Send className="w-4 h-4 mr-1.5" />
              Sign
            </Button>
          )}
          {document.status !== 'cancelled' && (
            <Button variant="ghost" size="sm" onClick={onReturn}>
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Return
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
