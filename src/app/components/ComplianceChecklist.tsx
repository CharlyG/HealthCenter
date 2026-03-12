/**
 * Compliance Checklist Component
 * 
 * Interactive checklist for QA reviewers to verify compliance items before
 * approving documents for billing. Includes required documentation, plan of
 * care updates, signed orders, visit frequency, and assessments.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Edit,
  User,
  Clock,
  ChevronRight,
  Info,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ChecklistItemStatus = 'verified' | 'failed' | 'not-applicable' | 'pending';

export type ChecklistCategory =
  | 'required-documentation'
  | 'plan-of-care'
  | 'orders-certification'
  | 'visit-frequency'
  | 'assessments'
  | 'signatures'
  | 'billing-requirements';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  required: boolean; // If true, must be verified before approval
  status: ChecklistItemStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  relatedDocuments?: string[];
  link?: {
    label: string;
    fieldId?: string;
    sectionName?: string;
  };
}

export interface ComplianceChecklistData {
  documentId: string;
  documentType: string;
  patientName: string;
  admissionId: string;
  items: ChecklistItem[];
  completedAt?: string;
  completedBy?: string;
  overallStatus: 'complete' | 'incomplete' | 'failed';
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<
  ChecklistItemStatus,
  { label: string; color: string; bgClass: string; textClass: string; icon: any }
> = {
  verified: {
    label: 'Verified',
    color: 'green',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    icon: CheckCircle,
  },
  failed: {
    label: 'Failed',
    color: 'red',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    icon: XCircle,
  },
  'not-applicable': {
    label: 'N/A',
    color: 'gray',
    bgClass: 'bg-gray-50',
    textClass: 'text-gray-700',
    icon: Info,
  },
  pending: {
    label: 'Pending',
    color: 'amber',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    icon: Clock,
  },
};

const CATEGORY_CONFIG: Record<
  ChecklistCategory,
  { label: string; icon: any; description: string }
> = {
  'required-documentation': {
    label: 'Required Documentation',
    icon: FileText,
    description: 'Core documentation that must be present',
  },
  'plan-of-care': {
    label: 'Plan of Care',
    icon: Edit,
    description: 'Plan of care updates and accuracy',
  },
  'orders-certification': {
    label: 'Orders & Certification',
    icon: FileText,
    description: 'Physician orders and certification documents',
  },
  'visit-frequency': {
    label: 'Visit Frequency',
    icon: Calendar,
    description: 'Visit frequency compliance',
  },
  assessments: {
    label: 'Assessments',
    icon: FileText,
    description: 'Required clinical assessments',
  },
  signatures: {
    label: 'Signatures',
    icon: User,
    description: 'Required signatures present',
  },
  'billing-requirements': {
    label: 'Billing Requirements',
    icon: FileText,
    description: 'Billing-specific compliance items',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ComplianceChecklistProps {
  data: ComplianceChecklistData;
  currentReviewer: string;
  onItemUpdate: (itemId: string, status: ChecklistItemStatus, notes?: string) => void;
  onComplete: () => void;
  onFieldClick?: (fieldId: string, sectionName: string) => void;
  mode?: 'full' | 'compact';
}

export default function ComplianceChecklist({
  data,
  currentReviewer,
  onItemUpdate,
  onComplete,
  onFieldClick,
  mode = 'full',
}: ComplianceChecklistProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<Record<string, string>>({});

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleStatusChange = (itemId: string, status: ChecklistItemStatus) => {
    const item = data.items.find((i) => i.id === itemId);
    onItemUpdate(itemId, status, item?.notes);
  };

  const handleSaveNotes = (itemId: string) => {
    const notes = tempNotes[itemId] || '';
    const item = data.items.find((i) => i.id === itemId);
    onItemUpdate(itemId, item?.status || 'pending', notes);
    setEditingNotes(null);
  };

  const handleStartEditNotes = (itemId: string, currentNotes?: string) => {
    setEditingNotes(itemId);
    setTempNotes({ ...tempNotes, [itemId]: currentNotes || '' });
  };

  // Calculate statistics
  const totalItems = data.items.length;
  const requiredItems = data.items.filter((i) => i.required).length;
  const verifiedItems = data.items.filter((i) => i.status === 'verified').length;
  const failedItems = data.items.filter((i) => i.status === 'failed').length;
  const pendingItems = data.items.filter((i) => i.status === 'pending').length;
  const requiredVerified = data.items.filter(
    (i) => i.required && i.status === 'verified'
  ).length;
  const requiredFailed = data.items.filter((i) => i.required && i.status === 'failed').length;

  const canComplete = requiredFailed === 0 && requiredVerified === requiredItems;

  // Group items by category
  const itemsByCategory = data.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<ChecklistCategory, ChecklistItem[]>);

  if (mode === 'compact') {
    return <CompactChecklist data={data} canComplete={canComplete} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Compliance Checklist</h2>
            <p className="text-sm text-gray-600 mt-1">
              {data.patientName} • {data.documentType} • {data.admissionId}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              data.overallStatus === 'complete'
                ? 'bg-green-100 text-green-700 border-green-300'
                : data.overallStatus === 'failed'
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-amber-100 text-amber-700 border-amber-300'
            )}
          >
            {data.overallStatus === 'complete'
              ? 'Complete'
              : data.overallStatus === 'failed'
              ? 'Failed'
              : 'In Progress'}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress ({verifiedItems}/{totalItems} verified)
              </span>
              <span className="text-sm text-gray-600">
                {Math.round((verifiedItems / totalItems) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all"
                style={{ width: `${(verifiedItems / totalItems) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Required Items ({requiredVerified}/{requiredItems} verified)
              </span>
              <span className="text-sm text-gray-600">
                {Math.round((requiredVerified / requiredItems) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${(requiredVerified / requiredItems) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <StatCard label="Verified" value={verifiedItems} color="green" icon={CheckCircle} />
          <StatCard label="Failed" value={failedItems} color="red" icon={XCircle} />
          <StatCard label="Pending" value={pendingItems} color="amber" icon={Clock} />
          <StatCard
            label="Required"
            value={requiredItems}
            color="blue"
            icon={AlertTriangle}
          />
        </div>

        {/* Warnings */}
        {requiredFailed > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-900">
                {requiredFailed} required item{requiredFailed > 1 ? 's' : ''} failed
              </span>
            </div>
            <p className="text-xs text-red-700 mt-1">
              Cannot approve for billing until all required items are verified
            </p>
          </div>
        )}

        {canComplete && (
          <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">
                All required items verified - Ready for approval
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Checklist Items by Category */}
      <div className="space-y-4">
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <ChecklistCategorySection
            key={category}
            category={category as ChecklistCategory}
            items={items}
            expandedItems={expandedItems}
            editingNotes={editingNotes}
            tempNotes={tempNotes}
            onToggleExpanded={toggleExpanded}
            onStatusChange={handleStatusChange}
            onStartEditNotes={handleStartEditNotes}
            onSaveNotes={handleSaveNotes}
            onCancelEditNotes={() => setEditingNotes(null)}
            onTempNotesChange={(itemId, notes) =>
              setTempNotes({ ...tempNotes, [itemId]: notes })
            }
            onFieldClick={onFieldClick}
          />
        ))}
      </div>

      {/* Complete Button */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {canComplete
                ? 'Checklist complete - Ready to approve for billing'
                : 'Complete all required items to approve'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {requiredVerified} of {requiredItems} required items verified
            </p>
          </div>
          <Button onClick={onComplete} disabled={!canComplete}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Checklist
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: any;
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-2 mb-1">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            colorClasses[color as keyof typeof colorClasses]
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKLIST CATEGORY SECTION
// ═══════════════════════════════════════════════════════════════════════════

interface ChecklistCategorySectionProps {
  category: ChecklistCategory;
  items: ChecklistItem[];
  expandedItems: Set<string>;
  editingNotes: string | null;
  tempNotes: Record<string, string>;
  onToggleExpanded: (itemId: string) => void;
  onStatusChange: (itemId: string, status: ChecklistItemStatus) => void;
  onStartEditNotes: (itemId: string, currentNotes?: string) => void;
  onSaveNotes: (itemId: string) => void;
  onCancelEditNotes: () => void;
  onTempNotesChange: (itemId: string, notes: string) => void;
  onFieldClick?: (fieldId: string, sectionName: string) => void;
}

function ChecklistCategorySection({
  category,
  items,
  expandedItems,
  editingNotes,
  tempNotes,
  onToggleExpanded,
  onStatusChange,
  onStartEditNotes,
  onSaveNotes,
  onCancelEditNotes,
  onTempNotesChange,
  onFieldClick,
}: ChecklistCategorySectionProps) {
  const categoryConfig = CATEGORY_CONFIG[category];
  const CategoryIcon = categoryConfig.icon;

  const verifiedCount = items.filter((i) => i.status === 'verified').length;
  const requiredCount = items.filter((i) => i.required).length;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <CategoryIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{categoryConfig.label}</h3>
          <p className="text-xs text-gray-600">{categoryConfig.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
            {verifiedCount}/{items.length} verified
          </Badge>
          {requiredCount > 0 && (
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              {requiredCount} required
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <ChecklistItemCard
            key={item.id}
            item={item}
            isExpanded={expandedItems.has(item.id)}
            isEditingNotes={editingNotes === item.id}
            tempNotes={tempNotes[item.id] || ''}
            onToggleExpanded={() => onToggleExpanded(item.id)}
            onStatusChange={(status) => onStatusChange(item.id, status)}
            onStartEditNotes={() => onStartEditNotes(item.id, item.notes)}
            onSaveNotes={() => onSaveNotes(item.id)}
            onCancelEditNotes={onCancelEditNotes}
            onTempNotesChange={(notes) => onTempNotesChange(item.id, notes)}
            onFieldClick={onFieldClick}
          />
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKLIST ITEM CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ChecklistItemCardProps {
  item: ChecklistItem;
  isExpanded: boolean;
  isEditingNotes: boolean;
  tempNotes: string;
  onToggleExpanded: () => void;
  onStatusChange: (status: ChecklistItemStatus) => void;
  onStartEditNotes: () => void;
  onSaveNotes: () => void;
  onCancelEditNotes: () => void;
  onTempNotesChange: (notes: string) => void;
  onFieldClick?: (fieldId: string, sectionName: string) => void;
}

function ChecklistItemCard({
  item,
  isExpanded,
  isEditingNotes,
  tempNotes,
  onToggleExpanded,
  onStatusChange,
  onStartEditNotes,
  onSaveNotes,
  onCancelEditNotes,
  onTempNotesChange,
  onFieldClick,
}: ChecklistItemCardProps) {
  const statusConfig = STATUS_CONFIG[item.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all',
        statusConfig.bgClass,
        `border-${statusConfig.color}-300`
      )}
    >
      <div className="flex items-start gap-3">
        <StatusIcon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', statusConfig.textClass)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                {item.required && (
                  <Badge
                    variant="outline"
                    className="bg-red-100 text-red-700 border-red-300 text-xs"
                  >
                    Required
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn('text-xs', statusConfig.bgClass, statusConfig.textClass)}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{item.description}</p>
            </div>

            <button
              onClick={onToggleExpanded}
              className="ml-4 p-1 hover:bg-white/50 rounded transition-colors"
            >
              <ChevronRight
                className={cn(
                  'w-5 h-5 transition-transform',
                  isExpanded && 'rotate-90',
                  statusConfig.textClass
                )}
              />
            </button>
          </div>

          {/* Status Selection */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-700 mb-2">Mark as:</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStatusChange('verified')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded border transition-all',
                  item.status === 'verified'
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                )}
              >
                <CheckCircle className="w-3 h-3 inline mr-1" />
                Verified
              </button>
              <button
                onClick={() => onStatusChange('failed')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded border transition-all',
                  item.status === 'failed'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                )}
              >
                <XCircle className="w-3 h-3 inline mr-1" />
                Failed
              </button>
              <button
                onClick={() => onStatusChange('not-applicable')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded border transition-all',
                  item.status === 'not-applicable'
                    ? 'bg-gray-100 text-gray-700 border-gray-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                )}
              >
                <Info className="w-3 h-3 inline mr-1" />
                N/A
              </button>
            </div>
          </div>

          {/* Link to Field */}
          {item.link && (
            <button
              onClick={() =>
                item.link?.fieldId && item.link?.sectionName
                  ? onFieldClick?.(item.link.fieldId, item.link.sectionName)
                  : undefined
              }
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mb-2"
            >
              <ExternalLink className="w-3 h-3" />
              {item.link.label}
            </button>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t space-y-3">
              {/* Verification Info */}
              {item.verifiedBy && (
                <div className="bg-white rounded p-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Verified by:</div>
                  <div className="text-sm text-gray-900">
                    <User className="w-3 h-3 inline mr-1" />
                    {item.verifiedBy}
                  </div>
                  {item.verifiedAt && (
                    <div className="text-xs text-gray-600 mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(item.verifiedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Related Documents */}
              {item.relatedDocuments && item.relatedDocuments.length > 0 && (
                <div className="bg-white rounded p-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">
                    Related Documents:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.relatedDocuments.map((doc, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-gray-100 text-gray-700 border-gray-300 text-xs"
                      >
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-white rounded p-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Reviewer Notes:</div>
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <Textarea
                      value={tempNotes}
                      onChange={(e) => onTempNotesChange(e.target.value)}
                      placeholder="Add notes about this item..."
                      className="h-20 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={onSaveNotes}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={onCancelEditNotes}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {item.notes ? (
                      <p className="text-sm text-gray-800 mb-2">{item.notes}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic mb-2">No notes</p>
                    )}
                    <Button size="sm" variant="outline" onClick={onStartEditNotes}>
                      <Edit className="w-3 h-3 mr-2" />
                      {item.notes ? 'Edit Notes' : 'Add Notes'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT CHECKLIST
// ═══════════════════════════════════════════════════════════════════════════

function CompactChecklist({
  data,
  canComplete,
}: {
  data: ComplianceChecklistData;
  canComplete: boolean;
}) {
  const verifiedItems = data.items.filter((i) => i.status === 'verified').length;
  const totalItems = data.items.length;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {canComplete ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Clock className="w-5 h-5 text-amber-600" />
          )}
          <div>
            <div className="font-semibold text-gray-900">Compliance Checklist</div>
            <div className="text-xs text-gray-600">
              {verifiedItems}/{totalItems} items verified
            </div>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            canComplete
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-amber-100 text-amber-700 border-amber-300'
          )}
        >
          {canComplete ? 'Complete' : 'In Progress'}
        </Badge>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockComplianceChecklistData(): ComplianceChecklistData {
  return {
    documentId: 'VN-2024-445',
    documentType: 'Visit Note',
    patientName: 'Margaret Johnson',
    admissionId: 'ADM-12345',
    items: [
      {
        id: 'check-1',
        category: 'required-documentation',
        title: 'Visit Note Completed',
        description: 'All required sections of visit note are completed',
        required: true,
        status: 'verified',
        verifiedBy: 'Jane Smith, QA Reviewer',
        verifiedAt: new Date().toISOString(),
        link: {
          label: 'Review Visit Note',
          fieldId: 'visit-note',
          sectionName: 'Documentation',
        },
      },
      {
        id: 'check-2',
        category: 'required-documentation',
        title: 'Vital Signs Documented',
        description: 'All required vital signs are recorded',
        required: true,
        status: 'verified',
        verifiedBy: 'Jane Smith, QA Reviewer',
        verifiedAt: new Date().toISOString(),
        notes: 'All vitals within normal range',
        link: {
          label: 'Go to Vital Signs',
          fieldId: 'vital-signs',
          sectionName: 'Assessment',
        },
      },
      {
        id: 'check-3',
        category: 'plan-of-care',
        title: 'Plan of Care Updated',
        description: 'POC reflects current patient status and needs',
        required: true,
        status: 'pending',
        relatedDocuments: ['485-2024-078'],
        link: {
          label: 'Review Plan of Care',
          fieldId: 'poc-485',
          sectionName: 'Plan of Care',
        },
      },
      {
        id: 'check-4',
        category: 'orders-certification',
        title: 'Physician Orders Signed',
        description: 'All active physician orders have valid signatures',
        required: true,
        status: 'failed',
        notes: 'Verbal order VO-2024-223 still requires physician signature',
        relatedDocuments: ['VO-2024-223'],
        link: {
          label: 'Review Orders',
          fieldId: 'physician-orders',
          sectionName: 'Orders',
        },
      },
      {
        id: 'check-5',
        category: 'visit-frequency',
        title: 'Visit Frequency Met',
        description: 'Visit frequency matches POC requirements',
        required: true,
        status: 'verified',
        verifiedBy: 'Jane Smith, QA Reviewer',
        verifiedAt: new Date().toISOString(),
        notes: 'On track for 3x/week SN visits',
      },
      {
        id: 'check-6',
        category: 'assessments',
        title: 'OASIS Assessment Current',
        description: 'OASIS assessment is complete and current',
        required: false,
        status: 'not-applicable',
        notes: 'Not a recertification visit',
      },
      {
        id: 'check-7',
        category: 'signatures',
        title: 'Clinician Signature Present',
        description: 'Visit note is signed by treating clinician',
        required: true,
        status: 'verified',
        verifiedBy: 'Jane Smith, QA Reviewer',
        verifiedAt: new Date().toISOString(),
      },
      {
        id: 'check-8',
        category: 'billing-requirements',
        title: 'ICD-10 Codes Valid',
        description: 'All diagnosis codes are valid and appropriate',
        required: true,
        status: 'verified',
        verifiedBy: 'Jane Smith, QA Reviewer',
        verifiedAt: new Date().toISOString(),
        notes: 'Primary and secondary diagnoses verified',
      },
      {
        id: 'check-9',
        category: 'billing-requirements',
        title: 'Homebound Status Documented',
        description: 'Clear documentation of homebound status',
        required: true,
        status: 'verified',
        verifiedBy: 'Jane Smith, QA Reviewer',
        verifiedAt: new Date().toISOString(),
      },
      {
        id: 'check-10',
        category: 'billing-requirements',
        title: 'Skilled Need Evident',
        description: 'Documentation supports skilled nursing need',
        required: true,
        status: 'verified',
        verifiedBy: 'Jane Smith, QA Reviewer',
        verifiedAt: new Date().toISOString(),
        notes: 'Wound care and medication management clearly documented',
      },
    ],
    overallStatus: 'incomplete',
  };
}
