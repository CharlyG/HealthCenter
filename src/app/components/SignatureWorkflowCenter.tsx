/**
 * Signature Workflow Center Component
 * 
 * Comprehensive tracking interface for managing signature requirements
 * on orders and certification documents. Tracks clinician, physician,
 * and medical director signatures with turnaround time monitoring.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Search,
  Filter,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  FileText,
  Calendar,
  Eye,
  RotateCcw,
  Bell,
  TrendingUp,
  UserCheck,
  Stethoscope,
  Shield,
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

export type SignatureType = 'clinician' | 'physician' | 'medical-director';

export type SignatureStatus = 'pending-signature' | 'signed' | 'returned' | 'overdue';

export interface SignatureItem {
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
  sentForSignatureDate: string;
  daysPending: number;
  status: SignatureStatus;
  assignedPhysician: {
    id: string;
    name: string;
    credentials?: string;
  };
  signatureType: SignatureType;
  remindersSent: number;
  lastReminderDate?: string;
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

const SIGNATURE_TYPE_CONFIG: Record<
  SignatureType,
  { label: string; icon: any; color: string }
> = {
  'clinician': {
    label: 'Clinician',
    icon: UserCheck,
    color: '#3B82F6',
  },
  'physician': {
    label: 'Physician',
    icon: Stethoscope,
    color: '#8B5CF6',
  },
  'medical-director': {
    label: 'Medical Director',
    icon: Shield,
    color: '#10B981',
  },
};

const STATUS_CONFIG: Record<
  SignatureStatus,
  { label: string; color: string; bgColor: string }
> = {
  'pending-signature': {
    label: 'Pending Signature',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  'signed': {
    label: 'Signed',
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
  'returned': {
    label: 'Returned',
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
  'overdue': {
    label: 'Overdue',
    color: '#DC2626',
    bgColor: '#FEE2E2',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

function generateMockSignatureItems(): SignatureItem[] {
  const now = new Date();
  
  return [
    {
      id: 'SIG-001',
      documentType: 'verbal-order',
      documentTitle: 'Increase Lasix to 40mg PO daily',
      patient: { id: 'PAT-001', name: 'Margaret Johnson' },
      admission: { id: 'ADM-12345' },
      sentForSignatureDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      daysPending: 5,
      status: 'overdue',
      assignedPhysician: { id: 'PHY-001', name: 'Dr. Sarah Mitchell', credentials: 'MD' },
      signatureType: 'physician',
      remindersSent: 2,
      lastReminderDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'SIG-002',
      documentType: 'plan-of-care',
      documentTitle: 'Initial Plan of Care - 60 day certification',
      patient: { id: 'PAT-002', name: 'Robert Williams' },
      admission: { id: 'ADM-12346' },
      sentForSignatureDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      daysPending: 2,
      status: 'pending-signature',
      assignedPhysician: { id: 'PHY-002', name: 'Dr. James Patterson', credentials: 'MD' },
      signatureType: 'physician',
      remindersSent: 0,
    },
    {
      id: 'SIG-003',
      documentType: 'recertification',
      documentTitle: 'Recertification - Period 2',
      patient: { id: 'PAT-003', name: 'Patricia Davis' },
      admission: { id: 'ADM-12347' },
      sentForSignatureDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      daysPending: 7,
      status: 'overdue',
      assignedPhysician: { id: 'PHY-001', name: 'Dr. Sarah Mitchell', credentials: 'MD' },
      signatureType: 'medical-director',
      remindersSent: 3,
      lastReminderDate: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'SIG-004',
      documentType: 'physician-order',
      documentTitle: 'Physical Therapy 3x per week',
      patient: { id: 'PAT-004', name: 'James Anderson' },
      admission: { id: 'ADM-12348' },
      sentForSignatureDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      daysPending: 1,
      status: 'pending-signature',
      assignedPhysician: { id: 'PHY-003', name: 'Dr. Amanda Rodriguez', credentials: 'MD' },
      signatureType: 'physician',
      remindersSent: 0,
    },
    {
      id: 'SIG-005',
      documentType: 'verbal-order',
      documentTitle: 'Hold metoprolol for SBP < 100',
      patient: { id: 'PAT-005', name: 'Maria Garcia' },
      admission: { id: 'ADM-12349' },
      sentForSignatureDate: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
      daysPending: 0,
      status: 'signed',
      assignedPhysician: { id: 'PHY-002', name: 'Dr. James Patterson', credentials: 'MD' },
      signatureType: 'physician',
      remindersSent: 0,
    },
    {
      id: 'SIG-006',
      documentType: 'plan-of-care',
      documentTitle: 'Plan of Care Amendment - Add OT',
      patient: { id: 'PAT-006', name: 'Linda Martinez' },
      admission: { id: 'ADM-12350' },
      sentForSignatureDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      daysPending: 4,
      status: 'overdue',
      assignedPhysician: { id: 'PHY-001', name: 'Dr. Sarah Mitchell', credentials: 'MD' },
      signatureType: 'physician',
      remindersSent: 1,
      lastReminderDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'SIG-007',
      documentType: 'discharge-certification',
      documentTitle: 'Discharge Certification',
      patient: { id: 'PAT-007', name: 'John Thompson' },
      admission: { id: 'ADM-12351' },
      sentForSignatureDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      daysPending: 3,
      status: 'returned',
      assignedPhysician: { id: 'PHY-003', name: 'Dr. Amanda Rodriguez', credentials: 'MD' },
      signatureType: 'physician',
      remindersSent: 1,
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SignatureWorkflowCenterProps {
  onViewDocument?: (itemId: string) => void;
  onSendReminder?: (itemId: string) => void;
  onMarkSigned?: (itemId: string) => void;
}

export default function SignatureWorkflowCenter({
  onViewDocument,
  onSendReminder,
  onMarkSigned,
}: SignatureWorkflowCenterProps) {
  const [items] = useState<SignatureItem[]>(generateMockSignatureItems());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SignatureStatus | 'all'>('all');
  const [signatureTypeFilter, setSignatureTypeFilter] = useState<SignatureType | 'all'>('all');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<DocumentType | 'all'>('all');

  // Filter items
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Signature type filter
    if (signatureTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.signatureType === signatureTypeFilter);
    }

    // Document type filter
    if (documentTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.documentType === documentTypeFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.documentTitle.toLowerCase().includes(term) ||
          item.patient.name.toLowerCase().includes(term) ||
          item.assignedPhysician.name.toLowerCase().includes(term) ||
          item.id.toLowerCase().includes(term)
      );
    }

    // Sort: overdue first, then by days pending descending
    return filtered.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      return b.daysPending - a.daysPending;
    });
  }, [items, statusFilter, signatureTypeFilter, documentTypeFilter, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending-signature').length,
      overdue: items.filter(i => i.status === 'overdue').length,
      avgDays: Math.round(
        items.filter(i => i.status !== 'signed').reduce((acc, i) => acc + i.daysPending, 0) /
          items.filter(i => i.status !== 'signed').length || 0
      ),
      signed: items.filter(i => i.status === 'signed').length,
      returned: items.filter(i => i.status === 'returned').length,
    };
  }, [items]);

  // Group by signature type
  const groupedByType = useMemo(() => {
    return {
      clinician: filteredItems.filter(i => i.signatureType === 'clinician'),
      physician: filteredItems.filter(i => i.signatureType === 'physician'),
      'medical-director': filteredItems.filter(i => i.signatureType === 'medical-director'),
    };
  }, [filteredItems]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Signature Workflow Center</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage signature requirements for orders and certifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <Card className="p-4">
        <div className="grid grid-cols-6 gap-4">
          <StatCard label="Total Items" value={stats.total} icon={FileText} />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            alert={stats.pending > 0}
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            alert={stats.overdue > 0}
          />
          <StatCard label="Avg Days Pending" value={`${stats.avgDays}d`} icon={TrendingUp} />
          <StatCard label="Signed" value={stats.signed} icon={CheckCircle} />
          <StatCard
            label="Returned"
            value={stats.returned}
            icon={RotateCcw}
            alert={stats.returned > 0}
          />
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by document, patient, physician, or ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as SignatureStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending-signature">Pending Signature</option>
                <option value="signed">Signed</option>
                <option value="returned">Returned</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Signature Type Filter */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Signature Type
              </label>
              <select
                value={signatureTypeFilter}
                onChange={e =>
                  setSignatureTypeFilter(e.target.value as SignatureType | 'all')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="clinician">Clinician</option>
                <option value="physician">Physician</option>
                <option value="medical-director">Medical Director</option>
              </select>
            </div>

            {/* Document Type Filter */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">
                Document Type
              </label>
              <select
                value={documentTypeFilter}
                onChange={e =>
                  setDocumentTypeFilter(e.target.value as DocumentType | 'all')
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Documents</option>
                <option value="physician-order">Physician Order</option>
                <option value="verbal-order">Verbal Order</option>
                <option value="plan-of-care">Plan of Care / 485</option>
                <option value="recertification">Recertification</option>
                <option value="discharge-certification">Discharge Certification</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Signature Type Tabs */}
      <div className="space-y-4">
        {/* Clinician Signatures */}
        {groupedByType.clinician.length > 0 && (
          <SignatureTypeSection
            signatureType="clinician"
            items={groupedByType.clinician}
            onViewDocument={onViewDocument}
            onSendReminder={onSendReminder}
            onMarkSigned={onMarkSigned}
          />
        )}

        {/* Physician Signatures */}
        {groupedByType.physician.length > 0 && (
          <SignatureTypeSection
            signatureType="physician"
            items={groupedByType.physician}
            onViewDocument={onViewDocument}
            onSendReminder={onSendReminder}
            onMarkSigned={onMarkSigned}
          />
        )}

        {/* Medical Director Signatures */}
        {groupedByType['medical-director'].length > 0 && (
          <SignatureTypeSection
            signatureType="medical-director"
            items={groupedByType['medical-director']}
            onViewDocument={onViewDocument}
            onSendReminder={onSendReminder}
            onMarkSigned={onMarkSigned}
          />
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <h4 className="font-semibold text-gray-900 mb-1">No Items Found</h4>
              <p className="text-sm text-gray-600">
                No signature items match your current filters
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  label: string;
  value: number | string;
  icon: any;
  alert?: boolean;
}

function StatCard({ label, value, icon: Icon, alert }: StatCardProps) {
  return (
    <div className={cn('text-center p-3 rounded-lg', alert ? 'bg-amber-50' : 'bg-gray-50')}>
      <Icon className={cn('w-5 h-5 mx-auto mb-2', alert ? 'text-amber-600' : 'text-gray-600')} />
      <p className="text-2xl font-bold" style={{ color: alert ? '#D97706' : '#111827' }}>
        {value}
      </p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SIGNATURE TYPE SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface SignatureTypeSectionProps {
  signatureType: SignatureType;
  items: SignatureItem[];
  onViewDocument?: (itemId: string) => void;
  onSendReminder?: (itemId: string) => void;
  onMarkSigned?: (itemId: string) => void;
}

function SignatureTypeSection({
  signatureType,
  items,
  onViewDocument,
  onSendReminder,
  onMarkSigned,
}: SignatureTypeSectionProps) {
  const config = SIGNATURE_TYPE_CONFIG[signatureType];
  const SectionIcon = config.icon;

  return (
    <Card>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <SectionIcon className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{config.label} Signatures</h3>
            <p className="text-sm text-gray-600">{items.length} item(s)</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y">
        {items.map(item => (
          <SignatureWorkflowItem
            key={item.id}
            item={item}
            onViewDocument={() => onViewDocument?.(item.id)}
            onSendReminder={() => onSendReminder?.(item.id)}
            onMarkSigned={() => onMarkSigned?.(item.id)}
          />
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SIGNATURE WORKFLOW ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface SignatureWorkflowItemProps {
  item: SignatureItem;
  onViewDocument?: () => void;
  onSendReminder?: () => void;
  onMarkSigned?: () => void;
}

function SignatureWorkflowItem({
  item,
  onViewDocument,
  onSendReminder,
  onMarkSigned,
}: SignatureWorkflowItemProps) {
  const statusConfig = STATUS_CONFIG[item.status];
  const isOverdue = item.status === 'overdue';
  const isReturned = item.status === 'returned';

  return (
    <div
      className={cn(
        'p-4 hover:bg-gray-50 transition-colors',
        isOverdue && 'bg-red-50/50 border-l-4 border-red-500',
        isReturned && 'bg-red-50/30'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Left: Document Info */}
        <div className="flex-1 min-w-0">
          {/* Top Row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{item.documentTitle}</h4>
                <Badge
                  style={{
                    backgroundColor: statusConfig.bgColor,
                    color: statusConfig.color,
                  }}
                >
                  {statusConfig.label}
                </Badge>
                {isOverdue && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {DOCUMENT_TYPE_LABELS[item.documentType]} • {item.id}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-5 gap-4 text-sm">
            {/* Patient */}
            <div>
              <p className="text-gray-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Patient
              </p>
              <p className="font-medium text-gray-900">{item.patient.name}</p>
            </div>

            {/* Admission */}
            <div>
              <p className="text-gray-600 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Admission
              </p>
              <p className="font-medium text-gray-900">{item.admission.id}</p>
            </div>

            {/* Sent For Signature */}
            <div>
              <p className="text-gray-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Sent Date
              </p>
              <p className="font-medium text-gray-900">
                {new Date(item.sentForSignatureDate).toLocaleDateString()}
              </p>
            </div>

            {/* Days Pending */}
            <div>
              <p className="text-gray-600 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Days Pending
              </p>
              <p
                className={cn(
                  'font-bold',
                  item.daysPending > 3 ? 'text-red-600' : 'text-gray-900'
                )}
              >
                {item.daysPending} days
              </p>
            </div>

            {/* Assigned Physician */}
            <div>
              <p className="text-gray-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Assigned Physician
              </p>
              <p className="font-medium text-gray-900">
                {item.assignedPhysician.name}
                {item.assignedPhysician.credentials &&
                  `, ${item.assignedPhysician.credentials}`}
              </p>
            </div>
          </div>

          {/* Reminders Info */}
          {item.remindersSent > 0 && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900">
                {item.remindersSent} reminder(s) sent
                {item.lastReminderDate &&
                  ` • Last sent ${new Date(item.lastReminderDate).toLocaleDateString()}`}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onViewDocument}>
            <Eye className="w-4 h-4 mr-1.5" />
            View
          </Button>

          {item.status === 'pending-signature' || item.status === 'overdue' ? (
            <>
              <Button variant="outline" size="sm" onClick={onSendReminder}>
                <Bell className="w-4 h-4 mr-1.5" />
                Remind
              </Button>
              <Button variant="default" size="sm" onClick={onMarkSigned}>
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Mark Signed
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
