/**
 * Episode Closure Checklist Component
 * 
 * Comprehensive checklist displaying all required items before a patient admission
 * can be considered complete. Helps agencies close admissions cleanly and avoid
 * missing final documentation through organized categories, status tracking, and
 * blocking dependencies.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  CheckCircle,
  Circle,
  XCircle,
  Lock,
  FileText,
  ClipboardList,
  Stethoscope,
  DollarSign,
  FileCheck,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  AlertTriangle,
  Activity,
  Target,
  Home,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ChecklistItemStatus = 'complete' | 'incomplete' | 'blocked';

export type ChecklistCategory =
  | 'clinical-documentation'
  | 'orders-certification'
  | 'assessments'
  | 'care-plan-goals'
  | 'billing-financial'
  | 'administrative';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  label: string;
  description: string;
  status: ChecklistItemStatus;
  required: boolean;
  completedDate?: string;
  completedBy?: string;
  blockedBy?: string[]; // IDs of items that must be complete first
  blockerMessage?: string;
}

export interface EpisodeClosureData {
  patientName: string;
  patientId: string;
  admissionId: string;
  admissionStartDate: string;
  dischargeDate: string;
  items: ChecklistItem[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_CONFIG: Record<
  ChecklistCategory,
  { label: string; icon: any; color: string; description: string }
> = {
  'clinical-documentation': {
    label: 'Clinical Documentation',
    icon: FileText,
    color: '#3B82F6',
    description: 'All clinical notes and documentation',
  },
  'orders-certification': {
    label: 'Orders & Certification',
    icon: Stethoscope,
    color: '#8B5CF6',
    description: 'Physician orders and certification documents',
  },
  'assessments': {
    label: 'Assessments',
    icon: ClipboardList,
    color: '#10B981',
    description: 'Required clinical assessments',
  },
  'care-plan-goals': {
    label: 'Care Plan & Goals',
    icon: Target,
    color: '#F59E0B',
    description: 'Care plan closure and goal documentation',
  },
  'billing-financial': {
    label: 'Billing & Financial',
    icon: DollarSign,
    color: '#EC4899',
    description: 'Billing handoff and financial closure',
  },
  'administrative': {
    label: 'Administrative',
    icon: FileCheck,
    color: '#06B6D4',
    description: 'Administrative tasks and closeout',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface EpisodeClosureChecklistProps {
  data: EpisodeClosureData;
  onCompleteItem?: (itemId: string) => void;
  onViewItem?: (itemId: string) => void;
  onCloseEpisode?: () => void;
}

export default function EpisodeClosureChecklist({
  data,
  onCompleteItem,
  onViewItem,
  onCloseEpisode,
}: EpisodeClosureChecklistProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<ChecklistCategory>>(
    new Set(Object.keys(CATEGORY_CONFIG) as ChecklistCategory[])
  );

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<ChecklistCategory, ChecklistItem[]> = {
      'clinical-documentation': [],
      'orders-certification': [],
      'assessments': [],
      'care-plan-goals': [],
      'billing-financial': [],
      'administrative': [],
    };

    data.items.forEach(item => {
      grouped[item.category].push(item);
    });

    return grouped;
  }, [data.items]);

  // Calculate statistics
  const stats = useMemo(() => {
    const requiredItems = data.items.filter(i => i.required);
    const completed = requiredItems.filter(i => i.status === 'complete').length;
    const incomplete = requiredItems.filter(i => i.status === 'incomplete').length;
    const blocked = requiredItems.filter(i => i.status === 'blocked').length;
    const total = requiredItems.length;
    const percentage = Math.round((completed / total) * 100) || 0;
    const isReady = completed === total;

    return { completed, incomplete, blocked, total, percentage, isReady };
  }, [data.items]);

  const toggleCategory = (category: ChecklistCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Episode Closure Checklist</h2>
          <p className="text-sm text-gray-600 mt-1">
            Complete all required items to close the admission
          </p>
        </div>
        {stats.isReady ? (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready to Close
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3 mr-1" />
            {stats.completed}/{stats.total} Complete
          </Badge>
        )}
      </div>

      {/* Patient & Admission Info */}
      <Card className="p-4">
        <div className="grid grid-cols-5 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Patient</p>
            <p className="font-semibold text-gray-900">{data.patientName}</p>
            <p className="text-xs text-gray-600">{data.patientId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Admission ID</p>
            <p className="font-semibold text-gray-900">{data.admissionId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Admission Start</p>
            <p className="font-semibold text-gray-900">
              {new Date(data.admissionStartDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Discharge Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(data.dischargeDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">Length of Stay</p>
            <p className="font-semibold text-gray-900">
              {Math.ceil(
                (new Date(data.dischargeDate).getTime() -
                  new Date(data.admissionStartDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              days
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Closure Progress</h3>
        <ClosureProgressSummary stats={stats} />
      </Card>

      {/* Checklist by Category */}
      <div className="space-y-4">
        {(Object.keys(CATEGORY_CONFIG) as ChecklistCategory[]).map(category => {
          const categoryItems = itemsByCategory[category];
          if (categoryItems.length === 0) return null;

          const config = CATEGORY_CONFIG[category];
          const isExpanded = expandedCategories.has(category);
          const categoryCompleted = categoryItems.filter(i => i.status === 'complete').length;
          const categoryTotal = categoryItems.filter(i => i.required).length;
          const categoryReady = categoryCompleted === categoryTotal;

          return (
            <Card key={category}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <config.icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">{config.label}</h4>
                    <p className="text-xs text-gray-600">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      categoryReady
                        ? 'bg-green-50 text-green-700 border-green-300'
                        : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {categoryCompleted}/{categoryTotal}
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="border-t p-4 space-y-3">
                  {categoryItems.map(item => (
                    <ChecklistItemCard
                      key={item.id}
                      item={item}
                      allItems={data.items}
                      onComplete={() => onCompleteItem?.(item.id)}
                      onView={() => onViewItem?.(item.id)}
                    />
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Blocked Items Warning */}
      {stats.blocked > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 text-sm mb-1">
                {stats.blocked} Item{stats.blocked !== 1 ? 's' : ''} Blocked
              </h4>
              <p className="text-xs text-red-700 mb-2">
                Some items cannot be completed until their dependencies are resolved.
              </p>
              <ul className="space-y-1">
                {data.items
                  .filter(i => i.status === 'blocked' && i.required)
                  .map(item => (
                    <li key={item.id} className="text-xs text-red-700 flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      {item.label} - {item.blockerMessage}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Incomplete Items Alert */}
      {!stats.isReady && stats.blocked === 0 && stats.incomplete > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 text-sm mb-1">
                {stats.incomplete} Item{stats.incomplete !== 1 ? 's' : ''} Remaining
              </h4>
              <p className="text-xs text-amber-700 mb-2">
                Complete all required items to close the episode.
              </p>
              <ul className="space-y-1">
                {data.items
                  .filter(i => i.status === 'incomplete' && i.required)
                  .map(item => (
                    <li key={item.id} className="text-xs text-amber-700 flex items-center gap-2">
                      <Circle className="w-3 h-3 fill-amber-600 text-amber-600" />
                      {item.label}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* All Complete Success */}
      {stats.isReady && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">Episode Closure Complete</h4>
              <p className="text-sm text-green-700 mb-4">
                All required items have been completed. The admission is ready to be closed.
              </p>
              <Button onClick={onCloseEpisode} className="bg-green-600 hover:bg-green-700">
                <Home className="w-4 h-4 mr-2" />
                Close Episode
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLOSURE PROGRESS SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

interface ClosureProgressSummaryProps {
  stats: {
    completed: number;
    incomplete: number;
    blocked: number;
    total: number;
    percentage: number;
    isReady: boolean;
  };
}

function ClosureProgressSummary({ stats }: ClosureProgressSummaryProps) {
  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {stats.completed} of {stats.total} Items Complete
          </span>
          <span className="text-lg font-bold text-gray-900">{stats.percentage}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              stats.isReady ? 'bg-green-600' : 'bg-blue-600'
            )}
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-green-900">Complete</p>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
        </div>
        <div className="text-center p-3 bg-amber-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Circle className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-medium text-amber-900">Incomplete</p>
          </div>
          <p className="text-2xl font-bold text-amber-900">{stats.incomplete}</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-red-600" />
            <p className="text-xs font-medium text-red-900">Blocked</p>
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.blocked}</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECKLIST ITEM CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ChecklistItemCardProps {
  item: ChecklistItem;
  allItems: ChecklistItem[];
  onComplete: () => void;
  onView: () => void;
}

function ChecklistItemCard({ item, allItems, onComplete, onView }: ChecklistItemCardProps) {
  const isComplete = item.status === 'complete';
  const isBlocked = item.status === 'blocked';
  const isIncomplete = item.status === 'incomplete';

  // Get blocker items
  const blockerItems = useMemo(() => {
    if (!item.blockedBy || item.blockedBy.length === 0) return [];
    return item.blockedBy
      .map(id => allItems.find(i => i.id === id))
      .filter(Boolean) as ChecklistItem[];
  }, [item.blockedBy, allItems]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-all',
        isComplete && 'bg-green-50 border-green-200',
        isBlocked && 'bg-red-50 border-red-200',
        isIncomplete && 'bg-gray-50 border-gray-200'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
          isComplete && 'bg-green-100',
          isBlocked && 'bg-red-100',
          isIncomplete && 'bg-white border border-gray-300'
        )}
      >
        {isComplete ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : isBlocked ? (
          <Lock className="w-5 h-5 text-red-600" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <h5
              className={cn(
                'font-semibold text-sm',
                isComplete && 'text-green-900',
                isBlocked && 'text-red-900',
                isIncomplete && 'text-gray-900'
              )}
            >
              {item.label}
            </h5>
            {!item.required && (
              <Badge variant="outline" className="text-xs">
                Optional
              </Badge>
            )}
          </div>
          {isComplete ? (
            <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          ) : isBlocked ? (
            <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Blocked
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
              <Circle className="w-3 h-3 mr-1" />
              Incomplete
            </Badge>
          )}
        </div>

        <p className="text-xs text-gray-600 mb-2">{item.description}</p>

        {/* Completed Info */}
        {isComplete && (
          <div className="text-xs text-green-700 mb-2">
            {item.completedDate && (
              <span>Completed {new Date(item.completedDate).toLocaleDateString()}</span>
            )}
            {item.completedBy && item.completedDate && <span> • </span>}
            {item.completedBy && <span>by {item.completedBy}</span>}
          </div>
        )}

        {/* Blocker Info */}
        {isBlocked && (
          <div className="text-xs text-red-700 bg-red-100 p-2 rounded mb-2">
            <p className="font-medium mb-1">
              <Lock className="w-3 h-3 inline mr-1" />
              {item.blockerMessage || 'This item is blocked by other items'}
            </p>
            {blockerItems.length > 0 && (
              <ul className="space-y-0.5 ml-4">
                {blockerItems.map(blocker => (
                  <li key={blocker.id} className="flex items-center gap-1">
                    <span className="text-red-600">•</span>
                    <span>
                      {blocker.label}
                      {blocker.status === 'complete' ? ' ✓' : ' (incomplete)'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isComplete && !isBlocked && (
            <Button size="sm" onClick={onComplete}>
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Complete
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onView}>
            View
          </Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockEpisodeClosureData(): EpisodeClosureData[] {
  return [
    {
      patientName: 'Margaret Johnson',
      patientId: 'PAT-001',
      admissionId: 'ADM-12345',
      admissionStartDate: '2024-09-15',
      dischargeDate: '2024-12-15',
      items: [
        // Clinical Documentation
        {
          id: 'doc-1',
          category: 'clinical-documentation',
          label: 'Final Documentation Completed',
          description: 'All visit notes and clinical documentation finalized',
          status: 'complete',
          required: true,
          completedDate: '2024-12-14',
          completedBy: 'Emily Chen, RN',
        },
        {
          id: 'doc-2',
          category: 'clinical-documentation',
          label: 'Discharge Summary Completed',
          description: 'Complete clinical discharge summary with outcomes',
          status: 'complete',
          required: true,
          completedDate: '2024-12-14',
          completedBy: 'Emily Chen, RN',
        },
        {
          id: 'doc-3',
          category: 'clinical-documentation',
          label: 'Final Visit Note',
          description: 'Final home visit documentation completed',
          status: 'complete',
          required: true,
          completedDate: '2024-12-13',
          completedBy: 'Sarah Johnson, PT',
        },
        // Orders & Certification
        {
          id: 'ord-1',
          category: 'orders-certification',
          label: 'All Orders Signed',
          description: 'All physician orders obtained and signed',
          status: 'incomplete',
          required: true,
        },
        {
          id: 'ord-2',
          category: 'orders-certification',
          label: 'Discharge Order Obtained',
          description: 'Physician discharge order on file',
          status: 'blocked',
          required: true,
          blockedBy: ['ord-1'],
          blockerMessage: 'Requires all orders to be signed first',
        },
        {
          id: 'ord-3',
          category: 'orders-certification',
          label: 'Certification Documents Complete',
          description: '485 and recertification documents finalized',
          status: 'complete',
          required: true,
          completedDate: '2024-12-10',
          completedBy: 'Michael Torres',
        },
        // Assessments
        {
          id: 'assess-1',
          category: 'assessments',
          label: 'Discharge Assessment Completed',
          description: 'OASIS-D discharge assessment completed',
          status: 'complete',
          required: true,
          completedDate: '2024-12-13',
          completedBy: 'Emily Chen, RN',
        },
        {
          id: 'assess-2',
          category: 'assessments',
          label: 'Assessment Transmitted to CMS',
          description: 'OASIS assessment successfully transmitted',
          status: 'blocked',
          required: true,
          blockedBy: ['assess-1'],
          blockerMessage: 'Requires discharge assessment to be completed',
        },
        // Care Plan & Goals
        {
          id: 'cp-1',
          category: 'care-plan-goals',
          label: 'Care Plan Closure',
          description: 'All care plan goals marked as met/not met',
          status: 'complete',
          required: true,
          completedDate: '2024-12-14',
          completedBy: 'Emily Chen, RN',
        },
        {
          id: 'cp-2',
          category: 'care-plan-goals',
          label: 'Goal Outcomes Documented',
          description: 'All clinical goals documented with outcomes',
          status: 'complete',
          required: true,
          completedDate: '2024-12-14',
          completedBy: 'Emily Chen, RN',
        },
        {
          id: 'cp-3',
          category: 'care-plan-goals',
          label: 'Patient Education Verified',
          description: 'Discharge education and instructions provided',
          status: 'complete',
          required: true,
          completedDate: '2024-12-13',
          completedBy: 'Emily Chen, RN',
        },
        // Billing & Financial
        {
          id: 'bill-1',
          category: 'billing-financial',
          label: 'Billing Handoff Completed',
          description: 'Episode information transferred to billing department',
          status: 'incomplete',
          required: true,
        },
        {
          id: 'bill-2',
          category: 'billing-financial',
          label: 'Final Visit Codes Verified',
          description: 'All visit codes reviewed for accuracy',
          status: 'incomplete',
          required: true,
        },
        {
          id: 'bill-3',
          category: 'billing-financial',
          label: 'Claims Submission Ready',
          description: 'Episode ready for final claims submission',
          status: 'blocked',
          required: true,
          blockedBy: ['bill-1', 'bill-2', 'ord-1'],
          blockerMessage: 'Requires billing handoff and all orders signed',
        },
        // Administrative
        {
          id: 'admin-1',
          category: 'administrative',
          label: 'Medical Records Complete',
          description: 'All documents filed in medical record',
          status: 'incomplete',
          required: true,
        },
        {
          id: 'admin-2',
          category: 'administrative',
          label: 'Quality Review Completed',
          description: 'QA review of episode completed',
          status: 'incomplete',
          required: false,
        },
        {
          id: 'admin-3',
          category: 'administrative',
          label: 'Patient Satisfaction Survey Sent',
          description: 'Patient satisfaction survey sent to patient',
          status: 'complete',
          required: false,
          completedDate: '2024-12-15',
          completedBy: 'System',
        },
      ],
    },
    {
      patientName: 'Robert Williams',
      patientId: 'PAT-002',
      admissionId: 'ADM-12346',
      admissionStartDate: '2024-10-01',
      dischargeDate: '2024-12-18',
      items: [
        // All items complete
        {
          id: 'doc-1',
          category: 'clinical-documentation',
          label: 'Final Documentation Completed',
          description: 'All visit notes and clinical documentation finalized',
          status: 'complete',
          required: true,
          completedDate: '2024-12-17',
          completedBy: 'Michael Torres, RN',
        },
        {
          id: 'doc-2',
          category: 'clinical-documentation',
          label: 'Discharge Summary Completed',
          description: 'Complete clinical discharge summary with outcomes',
          status: 'complete',
          required: true,
          completedDate: '2024-12-17',
          completedBy: 'Michael Torres, RN',
        },
        {
          id: 'doc-3',
          category: 'clinical-documentation',
          label: 'Final Visit Note',
          description: 'Final home visit documentation completed',
          status: 'complete',
          required: true,
          completedDate: '2024-12-16',
          completedBy: 'Michael Torres, RN',
        },
        {
          id: 'ord-1',
          category: 'orders-certification',
          label: 'All Orders Signed',
          description: 'All physician orders obtained and signed',
          status: 'complete',
          required: true,
          completedDate: '2024-12-17',
          completedBy: 'Dr. Sarah Mitchell',
        },
        {
          id: 'ord-2',
          category: 'orders-certification',
          label: 'Discharge Order Obtained',
          description: 'Physician discharge order on file',
          status: 'complete',
          required: true,
          completedDate: '2024-12-17',
          completedBy: 'Dr. Sarah Mitchell',
        },
        {
          id: 'ord-3',
          category: 'orders-certification',
          label: 'Certification Documents Complete',
          description: '485 and recertification documents finalized',
          status: 'complete',
          required: true,
          completedDate: '2024-12-15',
          completedBy: 'Michael Torres',
        },
        {
          id: 'assess-1',
          category: 'assessments',
          label: 'Discharge Assessment Completed',
          description: 'OASIS-D discharge assessment completed',
          status: 'complete',
          required: true,
          completedDate: '2024-12-16',
          completedBy: 'Michael Torres, RN',
        },
        {
          id: 'assess-2',
          category: 'assessments',
          label: 'Assessment Transmitted to CMS',
          description: 'OASIS assessment successfully transmitted',
          status: 'complete',
          required: true,
          completedDate: '2024-12-17',
          completedBy: 'System',
        },
        {
          id: 'cp-1',
          category: 'care-plan-goals',
          label: 'Care Plan Closure',
          description: 'All care plan goals marked as met/not met',
          status: 'complete',
          required: true,
          completedDate: '2024-12-17',
          completedBy: 'Michael Torres, RN',
        },
        {
          id: 'cp-2',
          category: 'care-plan-goals',
          label: 'Goal Outcomes Documented',
          description: 'All clinical goals documented with outcomes',
          status: 'complete',
          required: true,
          completedDate: '2024-12-17',
          completedBy: 'Michael Torres, RN',
        },
        {
          id: 'cp-3',
          category: 'care-plan-goals',
          label: 'Patient Education Verified',
          description: 'Discharge education and instructions provided',
          status: 'complete',
          required: true,
          completedDate: '2024-12-16',
          completedBy: 'Michael Torres, RN',
        },
        {
          id: 'bill-1',
          category: 'billing-financial',
          label: 'Billing Handoff Completed',
          description: 'Episode information transferred to billing department',
          status: 'complete',
          required: true,
          completedDate: '2024-12-18',
          completedBy: 'Billing Coordinator',
        },
        {
          id: 'bill-2',
          category: 'billing-financial',
          label: 'Final Visit Codes Verified',
          description: 'All visit codes reviewed for accuracy',
          status: 'complete',
          required: true,
          completedDate: '2024-12-18',
          completedBy: 'Billing Coordinator',
        },
        {
          id: 'bill-3',
          category: 'billing-financial',
          label: 'Claims Submission Ready',
          description: 'Episode ready for final claims submission',
          status: 'complete',
          required: true,
          completedDate: '2024-12-18',
          completedBy: 'Billing Coordinator',
        },
        {
          id: 'admin-1',
          category: 'administrative',
          label: 'Medical Records Complete',
          description: 'All documents filed in medical record',
          status: 'complete',
          required: true,
          completedDate: '2024-12-18',
          completedBy: 'Records Clerk',
        },
        {
          id: 'admin-2',
          category: 'administrative',
          label: 'Quality Review Completed',
          description: 'QA review of episode completed',
          status: 'complete',
          required: false,
          completedDate: '2024-12-18',
          completedBy: 'QA Specialist',
        },
        {
          id: 'admin-3',
          category: 'administrative',
          label: 'Patient Satisfaction Survey Sent',
          description: 'Patient satisfaction survey sent to patient',
          status: 'complete',
          required: false,
          completedDate: '2024-12-18',
          completedBy: 'System',
        },
      ],
    },
  ];
}
