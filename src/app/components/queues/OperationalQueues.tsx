/**
 * Operational Work Queues System
 * 
 * Action-oriented work queues for healthcare operations.
 * 
 * Queue Categories:
 * - Operations: Admissions, visits, EVV
 * - Clinical: Documentation, assessments, orders
 * - Billing: Claims, authorizations, denials
 * - Hospice: IDG notes, LOC changes, bereavement
 * 
 * Features:
 * - Real-time work item tracking
 * - Priority-based sorting
 * - Bulk actions
 * - Direct navigation to records
 * - Role-aware queue visibility
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  AlertTriangle,
  Clock,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Stethoscope,
  Receipt,
  Heart,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  AlertCircle,
  Briefcase,
  MapPin,
  Phone,
  DollarSign,
  Shield,
  ClipboardCheck,
  Activity,
  TrendingUp,
  Zap,
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

export type QueueCategory = 'operations' | 'clinical' | 'billing' | 'hospice';

export type QueueType =
  // Operations
  | 'admissions-incomplete'
  | 'delayed-visits'
  | 'evv-errors'
  | 'unassigned-visits'
  // Clinical
  | 'missing-documentation'
  | 'assessments-due'
  | 'orders-expiring'
  | 'signatures-needed'
  // Billing
  | 'claims-ready'
  | 'claims-rejected'
  | 'authorization-needed'
  | 'documentation-holds'
  // Hospice
  | 'idg-notes-due'
  | 'loc-changes'
  | 'bereavement-contacts'
  | 'recertifications-due';

export interface QueueItem {
  id: string;
  queueType: QueueType;
  priority: 'high' | 'medium' | 'low';
  patientId: string;
  patientName: string;
  admissionId: string;
  admissionStartDate: string;
  assignedStaff?: string;
  issueDescription: string;
  dueDate?: string;
  daysPending: number;
  status: 'pending' | 'in_progress' | 'resolved';
  metadata?: Record<string, any>;
  actionPath: string;
}

export interface QueueConfig {
  id: QueueType;
  category: QueueCategory;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'red' | 'orange' | 'amber' | 'blue' | 'green' | 'purple' | 'indigo';
}

// ==================== QUEUE CONFIGURATIONS ====================

export const queueConfigs: Record<QueueType, QueueConfig> = {
  // Operations Queues
  'admissions-incomplete': {
    id: 'admissions-incomplete',
    category: 'operations',
    title: 'Admissions Needing Completion',
    description: 'New admissions with incomplete intake documentation',
    icon: Briefcase,
    color: 'red',
  },
  'delayed-visits': {
    id: 'delayed-visits',
    category: 'operations',
    title: 'Delayed Visits',
    description: 'Scheduled visits past their scheduled time',
    icon: Clock,
    color: 'orange',
  },
  'evv-errors': {
    id: 'evv-errors',
    category: 'operations',
    title: 'EVV Errors',
    description: 'Electronic Visit Verification errors requiring correction',
    icon: AlertCircle,
    color: 'red',
  },
  'unassigned-visits': {
    id: 'unassigned-visits',
    category: 'operations',
    title: 'Unassigned Visits',
    description: 'Scheduled visits without clinician assignment',
    icon: User,
    color: 'amber',
  },

  // Clinical Queues
  'missing-documentation': {
    id: 'missing-documentation',
    category: 'clinical',
    title: 'Missing Documentation',
    description: 'Visit notes and assessments not yet documented',
    icon: FileText,
    color: 'orange',
  },
  'assessments-due': {
    id: 'assessments-due',
    category: 'clinical',
    title: 'Assessments Due',
    description: 'OASIS and other assessments approaching deadline',
    icon: ClipboardCheck,
    color: 'red',
  },
  'orders-expiring': {
    id: 'orders-expiring',
    category: 'clinical',
    title: 'Orders Expiring',
    description: 'Physician orders expiring within 7 days',
    icon: Stethoscope,
    color: 'amber',
  },
  'signatures-needed': {
    id: 'signatures-needed',
    category: 'clinical',
    title: 'Signatures Needed',
    description: 'Documents requiring physician or clinician signatures',
    icon: CheckCircle2,
    color: 'blue',
  },

  // Billing Queues
  'claims-ready': {
    id: 'claims-ready',
    category: 'billing',
    title: 'Claims Ready to Submit',
    description: 'Episodes ready for claim submission',
    icon: Receipt,
    color: 'green',
  },
  'claims-rejected': {
    id: 'claims-rejected',
    category: 'billing',
    title: 'Rejected Claims',
    description: 'Claims rejected by payer requiring correction',
    icon: XCircle,
    color: 'red',
  },
  'authorization-needed': {
    id: 'authorization-needed',
    category: 'billing',
    title: 'Authorization Needed',
    description: 'Admissions requiring authorization approval',
    icon: Shield,
    color: 'orange',
  },
  'documentation-holds': {
    id: 'documentation-holds',
    category: 'billing',
    title: 'Documentation Holds',
    description: 'Episodes with documentation holds blocking billing',
    icon: AlertTriangle,
    color: 'red',
  },

  // Hospice Queues
  'idg-notes-due': {
    id: 'idg-notes-due',
    category: 'hospice',
    title: 'IDG Notes Due',
    description: 'Interdisciplinary Group meeting notes pending',
    icon: FileText,
    color: 'orange',
  },
  'loc-changes': {
    id: 'loc-changes',
    category: 'hospice',
    title: 'Level of Care Changes',
    description: 'Patients requiring level of care assessment',
    icon: TrendingUp,
    color: 'amber',
  },
  'bereavement-contacts': {
    id: 'bereavement-contacts',
    category: 'hospice',
    title: 'Bereavement Contacts Needed',
    description: 'Family bereavement contacts due',
    icon: Heart,
    color: 'purple',
  },
  'recertifications-due': {
    id: 'recertifications-due',
    category: 'hospice',
    title: 'Hospice Recertifications Due',
    description: 'Hospice benefit periods requiring recertification',
    icon: Calendar,
    color: 'red',
  },
};

// ==================== QUEUE ITEM CARD ====================

interface QueueItemCardProps {
  item: QueueItem;
  onSelect: (item: QueueItem) => void;
  isSelected?: boolean;
}

export function QueueItemCard({ item, onSelect, isSelected }: QueueItemCardProps) {
  const navigate = useNavigate();
  const config = queueConfigs[item.queueType];

  const priorityColors = {
    high: 'text-red-700 bg-red-100 border-red-300',
    medium: 'text-amber-700 bg-amber-100 border-amber-300',
    low: 'text-blue-700 bg-blue-100 border-blue-300',
  };

  const handleClick = () => {
    navigate(item.actionPath);
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox for bulk selection */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(item);
          }}
          className="mt-1 size-4 rounded border-gray-300"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={priorityColors[item.priority]}>
                  {item.priority}
                </Badge>
                {item.daysPending > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {item.daysPending}d pending
                  </Badge>
                )}
              </div>
              <h4 className="font-bold text-gray-900 text-base">{item.patientName}</h4>
              <p className="text-sm text-gray-700 mt-1">{item.issueDescription}</p>
            </div>
            <ChevronRight className="size-5 text-gray-400 flex-shrink-0" />
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mt-3">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Briefcase className="size-3.5" />
              <span className="font-medium">{item.admissionId}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar className="size-3.5" />
              <span>{new Date(item.admissionStartDate).toLocaleDateString()}</span>
            </div>
            {item.assignedStaff && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <User className="size-3.5" />
                <span>{item.assignedStaff}</span>
              </div>
            )}
            {item.dueDate && (
              <div className="flex items-center gap-1.5 text-gray-600">
                <Clock className="size-3.5" />
                <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Quick Action */}
          <div className="mt-3">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(item.actionPath);
              }}
              className="h-8 text-xs"
            >
              Take Action
              <ChevronRight className="size-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== QUEUE HEADER ====================

interface QueueHeaderProps {
  config: QueueConfig;
  itemCount: number;
  selectedCount: number;
  onBulkAction?: (action: string) => void;
}

export function QueueHeader({ config, itemCount, selectedCount, onBulkAction }: QueueHeaderProps) {
  const Icon = config.icon;

  const colorClasses = {
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`size-12 rounded-lg flex items-center justify-center ${colorClasses[config.color]}`}>
          <Icon className="size-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge className="text-base px-3 py-1" variant="outline">
          {itemCount} items
        </Badge>
        {selectedCount > 0 && (
          <>
            <Badge className="text-base px-3 py-1 bg-blue-100 text-blue-800">
              {selectedCount} selected
            </Badge>
            {onBulkAction && (
              <Button
                size="sm"
                onClick={() => onBulkAction('bulk-assign')}
              >
                Bulk Action
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ==================== QUEUE FILTERS ====================

interface QueueFiltersProps {
  onSearch: (query: string) => void;
  onPriorityFilter: (priority: string) => void;
  onSortChange: (sort: string) => void;
}

export function QueueFilters({ onSearch, onPriorityFilter, onSortChange }: QueueFiltersProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search by patient name or admission ID..."
            className="pl-10"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Priority Filter */}
      <Select onValueChange={onPriorityFilter} defaultValue="all">
        <SelectTrigger className="w-[160px]">
          <Filter className="size-4 mr-2" />
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select onValueChange={onSortChange} defaultValue="priority">
        <SelectTrigger className="w-[180px]">
          <ArrowUpDown className="size-4 mr-2" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="priority">Priority</SelectItem>
          <SelectItem value="days-pending">Days Pending</SelectItem>
          <SelectItem value="due-date">Due Date</SelectItem>
          <SelectItem value="patient-name">Patient Name</SelectItem>
          <SelectItem value="admission-date">Admission Date</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ==================== QUEUE VIEW ====================

interface QueueViewProps {
  queueType: QueueType;
  items: QueueItem[];
  onBulkAction?: (action: string, items: QueueItem[]) => void;
}

export function QueueView({ queueType, items, onBulkAction }: QueueViewProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filteredItems, setFilteredItems] = useState<QueueItem[]>(items);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');

  const config = queueConfigs[queueType];

  // Apply filters and sorting
  React.useEffect(() => {
    let result = [...items];

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.admissionId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((item) => item.priority === priorityFilter);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case 'days-pending':
          return b.daysPending - a.daysPending;
        case 'due-date':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'patient-name':
          return a.patientName.localeCompare(b.patientName);
        case 'admission-date':
          return (
            new Date(b.admissionStartDate).getTime() - new Date(a.admissionStartDate).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredItems(result);
  }, [items, searchQuery, priorityFilter, sortBy]);

  const handleSelectItem = (item: QueueItem) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      newSelected.add(item.id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkAction = (action: string) => {
    const selected = filteredItems.filter((item) => selectedItems.has(item.id));
    if (onBulkAction) {
      onBulkAction(action, selected);
    }
  };

  return (
    <div>
      <QueueHeader
        config={config}
        itemCount={filteredItems.length}
        selectedCount={selectedItems.size}
        onBulkAction={handleBulkAction}
      />

      <QueueFilters
        onSearch={setSearchQuery}
        onPriorityFilter={setPriorityFilter}
        onSortChange={setSortBy}
      />

      {/* Queue Items */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Queue Clear!</h3>
            <p className="text-gray-600">No items in this queue</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <QueueItemCard
              key={item.id}
              item={item}
              onSelect={handleSelectItem}
              isSelected={selectedItems.has(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== QUEUE WORKSPACE ====================

interface QueueWorkspaceProps {
  category?: QueueCategory;
  initialQueue?: QueueType;
}

export function QueueWorkspace({ category, initialQueue }: QueueWorkspaceProps) {
  const [selectedQueue, setSelectedQueue] = useState<QueueType>(
    initialQueue || 'admissions-incomplete'
  );

  // Mock data - would come from API
  const mockItems: Record<QueueType, QueueItem[]> = {
    'admissions-incomplete': [
      {
        id: 'q1',
        queueType: 'admissions-incomplete',
        priority: 'high',
        patientId: 'PT-001',
        patientName: 'Johnson, Mary',
        admissionId: 'ADM-2024-001',
        admissionStartDate: '2024-03-01',
        assignedStaff: 'Sarah Thompson',
        issueDescription: 'Missing physician orders and initial assessment',
        daysPending: 5,
        status: 'pending',
        actionPath: '/admissions/ADM-2024-001',
      },
      {
        id: 'q2',
        queueType: 'admissions-incomplete',
        priority: 'medium',
        patientId: 'PT-002',
        patientName: 'Williams, Robert',
        admissionId: 'ADM-2024-015',
        admissionStartDate: '2024-03-08',
        assignedStaff: 'Michael Chen',
        issueDescription: 'Insurance verification pending',
        daysPending: 2,
        status: 'in_progress',
        actionPath: '/admissions/ADM-2024-015',
      },
    ],
    'delayed-visits': [
      {
        id: 'q3',
        queueType: 'delayed-visits',
        priority: 'high',
        patientId: 'PT-003',
        patientName: 'Smith, David',
        admissionId: 'ADM-2024-020',
        admissionStartDate: '2024-02-15',
        assignedStaff: 'Emily Davis, RN',
        issueDescription: 'RN visit scheduled for 9:00 AM, still not completed',
        dueDate: '2024-03-10',
        daysPending: 0,
        status: 'pending',
        actionPath: '/poc/visit/V-12345',
      },
    ],
    'evv-errors': [],
    'unassigned-visits': [],
    'missing-documentation': [
      {
        id: 'q4',
        queueType: 'missing-documentation',
        priority: 'high',
        patientId: 'PT-001',
        patientName: 'Johnson, Mary',
        admissionId: 'ADM-2024-001',
        admissionStartDate: '2024-03-01',
        assignedStaff: 'Sarah Thompson, RN',
        issueDescription: 'Visit completed 3 days ago, note not documented',
        daysPending: 3,
        status: 'pending',
        actionPath: '/clinical/visit-notes',
      },
    ],
    'assessments-due': [],
    'orders-expiring': [],
    'signatures-needed': [],
    'claims-ready': [],
    'claims-rejected': [],
    'authorization-needed': [],
    'documentation-holds': [],
    'idg-notes-due': [],
    'loc-changes': [],
    'bereavement-contacts': [],
    'recertifications-due': [],
  };

  const filteredQueues = category
    ? Object.values(queueConfigs).filter((q) => q.category === category)
    : Object.values(queueConfigs);

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="flex gap-6">
          {/* Queue Selector Sidebar */}
          <div className="w-80 flex-shrink-0">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Work Queues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {filteredQueues.map((queue) => {
                    const Icon = queue.icon;
                    const itemCount = mockItems[queue.id]?.length || 0;
                    const isSelected = selectedQueue === queue.id;

                    return (
                      <button
                        key={queue.id}
                        onClick={() => setSelectedQueue(queue.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          isSelected
                            ? 'bg-blue-100 text-blue-900 font-semibold shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`size-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                          <span className="text-sm">{queue.title}</span>
                        </div>
                        {itemCount > 0 && (
                          <Badge
                            className={
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : itemCount > 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-600'
                            }
                          >
                            {itemCount}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Queue Content */}
          <div className="flex-1">
            <QueueView
              queueType={selectedQueue}
              items={mockItems[selectedQueue] || []}
              onBulkAction={(action, items) => console.log(action, items)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
