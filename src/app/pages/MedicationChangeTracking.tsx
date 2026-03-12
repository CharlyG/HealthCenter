/**
 * Medication Change Tracking View
 * 
 * Comprehensive medication change history for active admission:
 * 
 * FEATURES:
 * - Timeline visualization of all medication changes
 * - Filterable by change type
 * - Detailed change cards with before/after comparison
 * - Summary statistics
 * - Export capability
 * - Search medications
 * 
 * CHANGE TYPES:
 * - Added (new medication)
 * - Discontinued (stopped)
 * - Dose changed (strength/dosage modified)
 * - Frequency changed (timing modified)
 * - Route changed (administration method)
 * - Status changed (active/held/discontinued)
 * 
 * USE CASES:
 * - Clinical review during visits
 * - Care coordination
 * - Quality assurance
 * - Audit trail
 * - Physician communication
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  ArrowLeft,
  History,
  Plus,
  Minus,
  Edit,
  Ban,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Clock,
  Pill,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ChangeType = 'added' | 'discontinued' | 'dose-changed' | 'frequency-changed' | 'route-changed' | 'status-changed';

interface MedicationChange {
  id: string;
  medicationId: string;
  medicationName: string;
  genericName?: string;
  changeType: ChangeType;
  changeDate: string;
  changedBy: string;
  changedByRole: string;
  reason: string;
  previousValue?: ChangeDetail;
  newValue?: ChangeDetail;
  orderId?: string;
  visitId?: string;
  notifiedPhysician: boolean;
  notes?: string;
}

interface ChangeDetail {
  strength?: string;
  dose?: string;
  frequency?: string;
  route?: string;
  status?: string;
}

interface ChangeTypeSummary {
  type: ChangeType;
  count: number;
  label: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_CHANGES: MedicationChange[] = [
  {
    id: 'change-001',
    medicationId: 'med-001',
    medicationName: 'Furosemide',
    genericName: 'Furosemide',
    changeType: 'added',
    changeDate: '2024-03-10T09:30:00Z',
    changedBy: 'Jennifer Lee, RN',
    changedByRole: 'RN Case Manager',
    reason: 'Started per hospital discharge orders for fluid management',
    newValue: {
      strength: '40mg',
      dose: '1 tablet',
      frequency: 'Once daily in the morning',
      route: 'Oral',
      status: 'Active',
    },
    orderId: 'order-123',
    notifiedPhysician: true,
    notes: 'Patient instructed on weight monitoring and signs of dehydration',
  },
  {
    id: 'change-002',
    medicationId: 'med-002',
    medicationName: 'Lisinopril',
    genericName: 'Lisinopril',
    changeType: 'dose-changed',
    changeDate: '2024-03-08T14:15:00Z',
    changedBy: 'Dr. Michael Chen',
    changedByRole: 'Physician',
    reason: 'Blood pressure running high, increased dose per physician order',
    previousValue: {
      strength: '10mg',
      dose: '1 tablet',
      frequency: 'Once daily',
      route: 'Oral',
    },
    newValue: {
      strength: '20mg',
      dose: '1 tablet',
      frequency: 'Once daily',
      route: 'Oral',
    },
    orderId: 'order-124',
    notifiedPhysician: false, // Physician made the change
    notes: 'Follow-up BP monitoring scheduled. Target BP <140/90',
  },
  {
    id: 'change-003',
    medicationId: 'med-003',
    medicationName: 'Metoprolol Succinate',
    genericName: 'Metoprolol Succinate ER',
    changeType: 'discontinued',
    changeDate: '2024-03-05T10:00:00Z',
    changedBy: 'Dr. Sarah Johnson',
    changedByRole: 'Physician',
    reason: 'Bradycardia noted. HR consistently in low 50s. Changed to different antihypertensive',
    previousValue: {
      strength: '50mg',
      dose: '1 tablet',
      frequency: 'Twice daily',
      route: 'Oral',
      status: 'Active',
    },
    newValue: {
      status: 'Discontinued',
    },
    orderId: 'order-125',
    notifiedPhysician: false,
    notes: 'Replaced with diltiazem. Monitor BP and HR',
  },
  {
    id: 'change-004',
    medicationId: 'med-004',
    medicationName: 'Gabapentin',
    genericName: 'Gabapentin',
    changeType: 'frequency-changed',
    changeDate: '2024-03-03T16:45:00Z',
    changedBy: 'Jennifer Lee, RN',
    changedByRole: 'RN Case Manager',
    reason: 'Patient reported excessive drowsiness. Reduced to twice daily per physician consultation',
    previousValue: {
      strength: '300mg',
      dose: '1 capsule',
      frequency: 'Three times daily',
      route: 'Oral',
    },
    newValue: {
      strength: '300mg',
      dose: '1 capsule',
      frequency: 'Twice daily (morning and bedtime)',
      route: 'Oral',
    },
    orderId: 'order-126',
    visitId: 'visit-789',
    notifiedPhysician: true,
    notes: 'Patient tolerating new schedule well. Less sedation reported',
  },
  {
    id: 'change-005',
    medicationId: 'med-005',
    medicationName: 'Warfarin Sodium',
    genericName: 'Warfarin Sodium',
    changeType: 'dose-changed',
    changeDate: '2024-03-12T11:00:00Z',
    changedBy: 'Dr. Michael Chen',
    changedByRole: 'Physician',
    reason: 'INR 1.8 (target 2.0-3.0). Increased dose per anticoagulation protocol',
    previousValue: {
      strength: '5mg',
      dose: '1 tablet',
      frequency: 'Once daily at 5pm',
      route: 'Oral',
    },
    newValue: {
      strength: '7.5mg',
      dose: '1.5 tablets',
      frequency: 'Once daily at 5pm',
      route: 'Oral',
    },
    orderId: 'order-127',
    notifiedPhysician: false,
    notes: 'Recheck INR in 3 days. Patient education on warfarin diet reinforced',
  },
  {
    id: 'change-006',
    medicationId: 'med-006',
    medicationName: 'Oxycodone HCl',
    genericName: 'Oxycodone Hydrochloride',
    changeType: 'status-changed',
    changeDate: '2024-03-07T09:15:00Z',
    changedBy: 'Jennifer Lee, RN',
    changedByRole: 'RN Case Manager',
    reason: 'Pain well controlled. Holding per patient request. Will restart if pain increases',
    previousValue: {
      status: 'Active',
    },
    newValue: {
      status: 'Held',
    },
    visitId: 'visit-790',
    notifiedPhysician: true,
    notes: 'Patient using acetaminophen PRN with good effect. Monitor pain levels',
  },
  {
    id: 'change-007',
    medicationId: 'med-007',
    medicationName: 'Diltiazem',
    genericName: 'Diltiazem HCl',
    changeType: 'added',
    changeDate: '2024-03-05T10:30:00Z',
    changedBy: 'Dr. Sarah Johnson',
    changedByRole: 'Physician',
    reason: 'Replacement for discontinued metoprolol. Better option given bradycardia',
    newValue: {
      strength: '120mg',
      dose: '1 tablet',
      frequency: 'Twice daily',
      route: 'Oral',
      status: 'Active',
    },
    orderId: 'order-128',
    notifiedPhysician: false,
    notes: 'Monitor BP and HR. Target BP <140/90, HR 60-100',
  },
  {
    id: 'change-008',
    medicationId: 'med-003',
    medicationName: 'Metoprolol Succinate',
    genericName: 'Metoprolol Succinate ER',
    changeType: 'added',
    changeDate: '2024-02-15T08:00:00Z',
    changedBy: 'System (Reconciliation)',
    changedByRole: 'System',
    reason: 'Medication reconciliation at admission from hospital discharge list',
    newValue: {
      strength: '50mg',
      dose: '1 tablet',
      frequency: 'Twice daily',
      route: 'Oral',
      status: 'Active',
    },
    notes: 'Reconciled from hospital discharge. Patient confirmed taking as prescribed',
  },
  {
    id: 'change-009',
    medicationId: 'med-004',
    medicationName: 'Gabapentin',
    genericName: 'Gabapentin',
    changeType: 'added',
    changeDate: '2024-02-15T08:00:00Z',
    changedBy: 'System (Reconciliation)',
    changedByRole: 'System',
    reason: 'Medication reconciliation at admission from patient profile',
    newValue: {
      strength: '300mg',
      dose: '1 capsule',
      frequency: 'Three times daily',
      route: 'Oral',
      status: 'Active',
    },
    notes: 'Patient taking for neuropathic pain. Last filled 2 weeks ago',
  },
  {
    id: 'change-010',
    medicationId: 'med-008',
    medicationName: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    changeType: 'route-changed',
    changeDate: '2024-03-01T13:00:00Z',
    changedBy: 'Jennifer Lee, RN',
    changedByRole: 'RN Case Manager',
    reason: 'Patient has difficulty swallowing tablets. Switched to liquid formulation',
    previousValue: {
      strength: '40mg',
      dose: '1 tablet',
      frequency: 'Once daily at bedtime',
      route: 'Oral - Tablet',
    },
    newValue: {
      strength: '40mg',
      dose: '8mL',
      frequency: 'Once daily at bedtime',
      route: 'Oral - Liquid',
    },
    orderId: 'order-129',
    visitId: 'visit-791',
    notifiedPhysician: true,
    notes: 'Pharmacy contacted. Liquid formulation dispensed. Patient tolerating well',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function MedicationChangeTracking() {
  const { admissionId } = useParams<{ admissionId: string }>();
  const navigate = useNavigate();

  const [changes] = useState(MOCK_CHANGES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<ChangeType>>(new Set());
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());

  // Filter and sort changes
  const filteredChanges = useMemo(() => {
    let filtered = changes;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(change =>
        change.medicationName.toLowerCase().includes(query) ||
        change.genericName?.toLowerCase().includes(query) ||
        change.reason.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (selectedTypes.size > 0) {
      filtered = filtered.filter(change => selectedTypes.has(change.changeType));
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.changeDate).getTime();
      const dateB = new Date(b.changeDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [changes, searchQuery, selectedTypes, sortOrder]);

  // Summary statistics
  const summary: ChangeTypeSummary[] = useMemo(() => {
    const counts = new Map<ChangeType, number>();
    changes.forEach(change => {
      counts.set(change.changeType, (counts.get(change.changeType) || 0) + 1);
    });

    return [
      { type: 'added', count: counts.get('added') || 0, label: 'Added' },
      { type: 'discontinued', count: counts.get('discontinued') || 0, label: 'Discontinued' },
      { type: 'dose-changed', count: counts.get('dose-changed') || 0, label: 'Dose Changed' },
      { type: 'frequency-changed', count: counts.get('frequency-changed') || 0, label: 'Frequency Changed' },
      { type: 'route-changed', count: counts.get('route-changed') || 0, label: 'Route Changed' },
      { type: 'status-changed', count: counts.get('status-changed') || 0, label: 'Status Changed' },
    ];
  }, [changes]);

  const handleToggleType = (type: ChangeType) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleToggleExpanded = (changeId: string) => {
    setExpandedChanges(prev => {
      const next = new Set(prev);
      if (next.has(changeId)) {
        next.delete(changeId);
      } else {
        next.add(changeId);
      }
      return next;
    });
  };

  const handleExport = () => {
    // Export to CSV
    console.log('Exporting medication changes...');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-6 h-6 text-blue-600" />
                  Medication Change History
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • Admission: SOC 02/15/2024
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search medication changes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Summary Card */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Total Changes</span>
                  <span className="font-bold text-gray-900">{changes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Medications Affected</span>
                  <span className="font-bold text-gray-900">
                    {new Set(changes.map(c => c.medicationId)).size}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Episode Days</span>
                  <span className="font-bold text-gray-900">25</span>
                </div>
              </div>
            </Card>

            {/* Filter by Type */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter by Type
                </h3>
                {selectedTypes.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTypes(new Set())}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {summary.map(item => (
                  <ChangeTypeFilter
                    key={item.type}
                    type={item.type}
                    label={item.label}
                    count={item.count}
                    isSelected={selectedTypes.has(item.type)}
                    onToggle={handleToggleType}
                  />
                ))}
              </div>
            </Card>

            {/* Legend */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded" />
                  <span className="text-gray-700">Added</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 rounded" />
                  <span className="text-gray-700">Discontinued</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 rounded" />
                  <span className="text-gray-700">Modified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-100 rounded" />
                  <span className="text-gray-700">Status Change</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Timeline */}
          <div className="col-span-9">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Change Timeline ({filteredChanges.length})
                </h2>
              </div>

              {filteredChanges.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" />
                  <p className="text-gray-600 mb-1">No changes found</p>
                  <p className="text-sm text-gray-500">
                    {selectedTypes.size > 0 || searchQuery
                      ? 'Try adjusting your filters'
                      : 'Medication changes will appear here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChanges.map((change, index) => (
                    <ChangeCard
                      key={change.id}
                      change={change}
                      isExpanded={expandedChanges.has(change.id)}
                      onToggleExpanded={handleToggleExpanded}
                      showDateDivider={
                        index === 0 ||
                        new Date(change.changeDate).toLocaleDateString() !==
                          new Date(filteredChanges[index - 1].changeDate).toLocaleDateString()
                      }
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHANGE TYPE FILTER
// ═══════════════════════════════════════════════════════════════════════════

interface ChangeTypeFilterProps {
  type: ChangeType;
  label: string;
  count: number;
  isSelected: boolean;
  onToggle: (type: ChangeType) => void;
}

function ChangeTypeFilter({ type, label, count, isSelected, onToggle }: ChangeTypeFilterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all',
        isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
      )}
      onClick={() => onToggle(type)}
    >
      <div className="flex items-center gap-2">
        <Checkbox checked={isSelected} />
        <span className="text-sm text-gray-900">{label}</span>
      </div>
      <Badge variant="outline" className="text-xs">
        {count}
      </Badge>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHANGE CARD
// ═══════════════════════════════════════════════════════════════════════════

interface ChangeCardProps {
  change: MedicationChange;
  isExpanded: boolean;
  onToggleExpanded: (changeId: string) => void;
  showDateDivider: boolean;
}

function ChangeCard({ change, isExpanded, onToggleExpanded, showDateDivider }: ChangeCardProps) {
  const config = getChangeTypeConfig(change.changeType);
  const Icon = config.icon;

  return (
    <>
      {showDateDivider && (
        <div className="flex items-center gap-3 py-2">
          <div className="h-px bg-gray-200 flex-1" />
          <div className="text-sm font-medium text-gray-600">
            {new Date(change.changeDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
      )}

      <Card
        className={cn(
          'p-4 border-l-4 transition-all cursor-pointer',
          config.borderColor,
          isExpanded && 'shadow-md'
        )}
        onClick={() => onToggleExpanded(change.id)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon className={cn('w-5 h-5', config.iconColor)} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900">{change.medicationName}</h4>
                <Badge className={cn('text-xs', config.badgeColor)}>
                  {config.label}
                </Badge>
              </div>
              {change.genericName && (
                <p className="text-sm text-gray-600">{change.genericName}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">
              {new Date(change.changeDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">{change.changedBy}</span>
          </div>
          {change.notifiedPhysician && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">Physician notified</span>
            </div>
          )}
        </div>

        {/* Reason */}
        <div className="p-3 bg-gray-50 rounded-lg mb-3">
          <p className="text-sm text-gray-900">
            <strong>Reason:</strong> {change.reason}
          </p>
        </div>

        {/* Change Details */}
        {change.changeType !== 'added' && change.changeType !== 'discontinued' && (
          <ChangeComparison
            changeType={change.changeType}
            previousValue={change.previousValue}
            newValue={change.newValue}
          />
        )}

        {change.changeType === 'added' && change.newValue && (
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">
              <strong>Added:</strong> {change.newValue.strength} {change.newValue.dose},{' '}
              {change.newValue.frequency}
            </p>
            {change.newValue.route && (
              <p className="text-gray-700">
                <strong>Route:</strong> {change.newValue.route}
              </p>
            )}
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Changed By:</p>
                <p className="font-medium text-gray-900">{change.changedBy}</p>
                <p className="text-xs text-gray-600">{change.changedByRole}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Date & Time:</p>
                <p className="font-medium text-gray-900">
                  {new Date(change.changeDate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {change.orderId && (
              <div className="text-sm">
                <p className="text-gray-600 mb-1">Order ID:</p>
                <p className="font-medium text-gray-900 font-mono">{change.orderId}</p>
              </div>
            )}

            {change.visitId && (
              <div className="text-sm">
                <p className="text-gray-600 mb-1">Associated Visit:</p>
                <p className="font-medium text-gray-900 font-mono">{change.visitId}</p>
              </div>
            )}

            {change.notes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-900 mb-1">Clinical Notes:</p>
                <p className="text-sm text-blue-800">{change.notes}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHANGE COMPARISON
// ═══════════════════════════════════════════════════════════════════════════

interface ChangeComparisonProps {
  changeType: ChangeType;
  previousValue?: ChangeDetail;
  newValue?: ChangeDetail;
}

function ChangeComparison({ changeType, previousValue, newValue }: ChangeComparisonProps) {
  if (!previousValue || !newValue) return null;

  const renderComparison = () => {
    switch (changeType) {
      case 'dose-changed':
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-700 mb-1">Previous Dose:</p>
              <p className="text-sm font-medium text-red-900">
                {previousValue.strength} {previousValue.dose}
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-700 mb-1">New Dose:</p>
              <p className="text-sm font-medium text-green-900">
                {newValue.strength} {newValue.dose}
              </p>
            </div>
          </div>
        );

      case 'frequency-changed':
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-700 mb-1">Previous Frequency:</p>
              <p className="text-sm font-medium text-red-900">{previousValue.frequency}</p>
            </div>
            <RefreshCw className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-700 mb-1">New Frequency:</p>
              <p className="text-sm font-medium text-green-900">{newValue.frequency}</p>
            </div>
          </div>
        );

      case 'route-changed':
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-700 mb-1">Previous Route:</p>
              <p className="text-sm font-medium text-red-900">{previousValue.route}</p>
            </div>
            <Edit className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-700 mb-1">New Route:</p>
              <p className="text-sm font-medium text-green-900">{newValue.route}</p>
            </div>
          </div>
        );

      case 'status-changed':
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-700 mb-1">Previous Status:</p>
              <p className="text-sm font-medium text-red-900">{previousValue.status}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-700 mb-1">New Status:</p>
              <p className="text-sm font-medium text-green-900">{newValue.status}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="mb-3">{renderComparison()}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getChangeTypeConfig(type: ChangeType) {
  const configs = {
    'added': {
      icon: Plus,
      label: 'Added',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-l-green-500',
      badgeColor: 'bg-green-100 text-green-800',
    },
    'discontinued': {
      icon: Minus,
      label: 'Discontinued',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-l-red-500',
      badgeColor: 'bg-red-100 text-red-800',
    },
    'dose-changed': {
      icon: TrendingUp,
      label: 'Dose Changed',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-blue-500',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    'frequency-changed': {
      icon: RefreshCw,
      label: 'Frequency Changed',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-l-purple-500',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    'route-changed': {
      icon: Edit,
      label: 'Route Changed',
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      borderColor: 'border-l-indigo-500',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    'status-changed': {
      icon: Ban,
      label: 'Status Changed',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      borderColor: 'border-l-amber-500',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
  };

  return configs[type];
}
