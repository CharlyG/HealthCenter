/**
 * Admission Pipeline Workspace
 * 
 * Kanban-style pipeline for intake coordinators to manage admissions
 * through various stages from referral to admitted.
 * 
 * Pipeline Stages:
 * 1. New Referral - Initial referral received
 * 2. Admission Setup - Gathering required information
 * 3. Pending Authorization - Waiting for payer authorization
 * 4. Ready for Care - All requirements met, ready to start
 * 5. Admitted - Patient has started care
 * 
 * Features:
 * - Drag & drop between stages
 * - Readiness status integration
 * - Filterable by coordinator, payer, service type
 * - Stats per stage
 * - Quick actions on cards
 */

import { useState, useCallback, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router';
import {
  Users,
  Calendar,
  Shield,
  UserCircle,
  Filter,
  Search,
  Plus,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  MoreVertical,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { PageHeader, PageSection } from '../design-system/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ReadinessBadge, type ReadinessState } from '../admission/AdmissionReadiness';
import { toast } from 'sonner';

// ==================== TYPE DEFINITIONS ====================

export type PipelineStage = 
  | 'new_referral' 
  | 'admission_setup' 
  | 'pending_authorization' 
  | 'ready_for_care' 
  | 'admitted';

export interface AdmissionCard {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  admission_date: string;
  start_of_care_date?: string;
  service_type: 'Home Health' | 'Hospice';
  primary_payer: string;
  payer_type: 'Medicare' | 'Medicaid' | 'Commercial' | 'Self-Pay';
  assigned_coordinator: string;
  coordinator_id: string;
  stage: PipelineStage;
  readiness_status: ReadinessState;
  readiness_progress: number;
  days_in_stage: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  has_blockers: boolean;
  blocker_count: number;
  referral_source?: string;
  referral_date: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineStageConfig {
  id: PipelineStage;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// ==================== PIPELINE STAGE CONFIGS ====================

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id: 'new_referral',
    label: 'New Referral',
    color: 'blue',
    icon: FileText,
    description: 'Initial referral received, not yet started',
  },
  {
    id: 'admission_setup',
    label: 'Admission Setup',
    color: 'purple',
    icon: Edit,
    description: 'Gathering required information',
  },
  {
    id: 'pending_authorization',
    label: 'Pending Authorization',
    color: 'amber',
    icon: Clock,
    description: 'Waiting for payer authorization',
  },
  {
    id: 'ready_for_care',
    label: 'Ready for Care',
    color: 'green',
    icon: CheckCircle2,
    description: 'All requirements met, ready to start',
  },
  {
    id: 'admitted',
    label: 'Admitted',
    color: 'gray',
    icon: Users,
    description: 'Patient has started care',
  },
];

// ==================== DRAG & DROP TYPES ====================

const ItemTypes = {
  ADMISSION_CARD: 'admission_card',
};

// ==================== ADMISSION CARD COMPONENT ====================

interface AdmissionCardComponentProps {
  admission: AdmissionCard;
  onMove: (admissionId: string, targetStage: PipelineStage) => void;
  onView: (admissionId: string) => void;
  onEdit: (admissionId: string) => void;
}

function AdmissionCardComponent({ admission, onMove, onView, onEdit }: AdmissionCardComponentProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ADMISSION_CARD,
    item: { admission },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  return (
    <div
      ref={drag}
      className={`bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm mb-1">
            {admission.patient_name}
          </h4>
          <p className="text-xs text-gray-600">MRN: {admission.patient_mrn}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(admission.id)}>
              <Eye className="size-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(admission.id)}>
              <Edit className="size-4 mr-2" />
              Edit Admission
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <XCircle className="size-4 mr-2" />
              Cancel Referral
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Readiness Status */}
      <div className="mb-3">
        <ReadinessBadge state={admission.readiness_status} size="sm" />
        {admission.has_blockers && (
          <Badge className="ml-2 bg-red-100 text-red-700 text-xs">
            {admission.blocker_count} Blocker{admission.blocker_count > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="size-3.5 text-gray-500" />
          <span className="text-gray-700">
            {admission.start_of_care_date 
              ? `SOC: ${new Date(admission.start_of_care_date).toLocaleDateString()}`
              : `Referral: ${new Date(admission.referral_date).toLocaleDateString()}`
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 text-gray-500" />
          <span className="text-gray-700">{admission.primary_payer}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserCircle className="size-3.5 text-gray-500" />
          <span className="text-gray-700">{admission.assigned_coordinator}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
        <Badge variant="outline" className={`text-xs ${priorityColors[admission.priority]}`}>
          {admission.priority.toUpperCase()}
        </Badge>
        <span className="text-xs text-gray-600">
          {admission.days_in_stage} day{admission.days_in_stage !== 1 ? 's' : ''} in stage
        </span>
      </div>
    </div>
  );
}

// ==================== PIPELINE STAGE COLUMN ====================

interface PipelineStageColumnProps {
  stage: PipelineStageConfig;
  admissions: AdmissionCard[];
  onDrop: (admission: AdmissionCard, targetStage: PipelineStage) => void;
  onView: (admissionId: string) => void;
  onEdit: (admissionId: string) => void;
}

function PipelineStageColumn({ stage, admissions, onDrop, onView, onEdit }: PipelineStageColumnProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.ADMISSION_CARD,
    drop: (item: { admission: AdmissionCard }) => {
      onDrop(item.admission, stage.id);
    },
    canDrop: (item: { admission: AdmissionCard }) => {
      // Prevent dropping in the same stage
      return item.admission.stage !== stage.id;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const Icon = stage.icon;

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-300 text-blue-700',
    purple: 'bg-purple-50 border-purple-300 text-purple-700',
    amber: 'bg-amber-50 border-amber-300 text-amber-700',
    green: 'bg-green-50 border-green-300 text-green-700',
    gray: 'bg-gray-50 border-gray-300 text-gray-700',
  };

  const handleMove = (admissionId: string, targetStage: PipelineStage) => {
    const admission = admissions.find(a => a.id === admissionId);
    if (admission) {
      onDrop(admission, targetStage);
    }
  };

  return (
    <div className="flex-1 min-w-[280px] flex flex-col">
      {/* Stage Header */}
      <div className={`p-3 border-2 rounded-t-lg ${colorClasses[stage.color as keyof typeof colorClasses]}`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="size-4" />
          <h3 className="font-semibold text-sm">{stage.label}</h3>
          <Badge className="ml-auto bg-white/50">{admissions.length}</Badge>
        </div>
        <p className="text-xs opacity-80">{stage.description}</p>
      </div>

      {/* Drop Zone */}
      <div
        ref={drop}
        className={`flex-1 p-3 border-2 border-t-0 rounded-b-lg min-h-[600px] ${
          isOver && canDrop
            ? 'bg-blue-50 border-blue-300 border-dashed'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="space-y-3">
          {admissions.map((admission) => (
            <AdmissionCardComponent
              key={admission.id}
              admission={admission}
              onMove={handleMove}
              onView={onView}
              onEdit={onEdit}
            />
          ))}
          {admissions.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No admissions in this stage
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN PIPELINE WORKSPACE ====================

interface AdmissionPipelineProps {
  initialAdmissions?: AdmissionCard[];
}

export default function AdmissionPipeline({ initialAdmissions }: AdmissionPipelineProps) {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState<AdmissionCard[]>(initialAdmissions || generateMockAdmissions());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCoordinator, setFilterCoordinator] = useState('all');
  const [filterPayer, setFilterPayer] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');

  // Filter admissions
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((admission) => {
      const matchesSearch = 
        admission.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admission.patient_mrn.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCoordinator = 
        filterCoordinator === 'all' || admission.coordinator_id === filterCoordinator;
      
      const matchesPayer = 
        filterPayer === 'all' || admission.payer_type === filterPayer;
      
      const matchesServiceType = 
        filterServiceType === 'all' || admission.service_type === filterServiceType;

      return matchesSearch && matchesCoordinator && matchesPayer && matchesServiceType;
    });
  }, [admissions, searchQuery, filterCoordinator, filterPayer, filterServiceType]);

  // Group by stage
  const admissionsByStage = useMemo(() => {
    const grouped: Record<PipelineStage, AdmissionCard[]> = {
      new_referral: [],
      admission_setup: [],
      pending_authorization: [],
      ready_for_care: [],
      admitted: [],
    };

    filteredAdmissions.forEach((admission) => {
      grouped[admission.stage].push(admission);
    });

    return grouped;
  }, [filteredAdmissions]);

  // Handle card drop
  const handleDrop = useCallback((admission: AdmissionCard, targetStage: PipelineStage) => {
    if (admission.stage === targetStage) return;

    setAdmissions((prev) =>
      prev.map((a) =>
        a.id === admission.id
          ? { ...a, stage: targetStage, updated_at: new Date().toISOString() }
          : a
      )
    );

    const stageLabel = PIPELINE_STAGES.find(s => s.id === targetStage)?.label;
    toast.success(`Moved ${admission.patient_name} to ${stageLabel}`, {
      description: 'Pipeline updated successfully',
    });
  }, []);

  const handleView = (admissionId: string) => {
    navigate(`/admissions/${admissionId}`);
  };

  const handleEdit = (admissionId: string) => {
    navigate(`/admissions/${admissionId}`);
  };

  // Get unique coordinators and payers for filters
  const coordinators = useMemo(() => {
    const unique = new Set(admissions.map(a => a.assigned_coordinator));
    return Array.from(unique);
  }, [admissions]);

  const payers = useMemo(() => {
    const unique = new Set(admissions.map(a => a.payer_type));
    return Array.from(unique);
  }, [admissions]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredAdmissions.length;
    const withBlockers = filteredAdmissions.filter(a => a.has_blockers).length;
    const urgent = filteredAdmissions.filter(a => a.priority === 'urgent').length;
    const avgDaysInStage = total > 0
      ? Math.round(filteredAdmissions.reduce((sum, a) => sum + a.days_in_stage, 0) / total)
      : 0;

    return { total, withBlockers, urgent, avgDaysInStage };
  }, [filteredAdmissions]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col bg-gray-50">
        <div className="flex-1 overflow-auto">
          <div className="max-w-[1800px] mx-auto p-6">
            <PageHeader
              icon={<TrendingUp className="size-8" />}
              title="Admission Pipeline"
              subtitle="Manage admissions from referral to care start"
              actions={
                <Button onClick={() => navigate('/admissions/new')}>
                  <Plus className="size-4 mr-2" />
                  New Referral
                </Button>
              }
            />

            {/* Stats */}
            <PageSection>
              <div className="grid grid-cols-4 gap-4">
                <StatCard label="Total Admissions" value={stats.total} color="blue" />
                <StatCard label="With Blockers" value={stats.withBlockers} color="red" alert={stats.withBlockers > 0} />
                <StatCard label="Urgent Priority" value={stats.urgent} color="orange" alert={stats.urgent > 0} />
                <StatCard label="Avg Days in Stage" value={stats.avgDaysInStage} color="purple" />
              </div>
            </PageSection>

            {/* Filters */}
            <PageSection>
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                          placeholder="Search by patient name or MRN..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Select value={filterCoordinator} onValueChange={setFilterCoordinator}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Coordinators" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Coordinators</SelectItem>
                        {coordinators.map((coordinator) => (
                          <SelectItem key={coordinator} value={coordinator}>
                            {coordinator}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterPayer} onValueChange={setFilterPayer}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Payers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Payers</SelectItem>
                        {payers.map((payer) => (
                          <SelectItem key={payer} value={payer}>
                            {payer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterServiceType} onValueChange={setFilterServiceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Service Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Service Types</SelectItem>
                        <SelectItem value="Home Health">Home Health</SelectItem>
                        <SelectItem value="Hospice">Hospice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </PageSection>

            {/* Pipeline Board */}
            <PageSection>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {PIPELINE_STAGES.map((stage) => (
                  <PipelineStageColumn
                    key={stage.id}
                    stage={stage}
                    admissions={admissionsByStage[stage.id]}
                    onDrop={handleDrop}
                    onView={handleView}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </PageSection>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

// ==================== STAT CARD ====================

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  alert?: boolean;
}

function StatCard({ label, value, color, alert }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
  };

  return (
    <Card className={alert ? 'ring-1 ring-red-200' : ''}>
      <CardContent className="p-4 text-center">
        <p className={`text-3xl font-bold ${colorMap[color] || 'text-gray-700'}`}>{value}</p>
        <p className="text-xs font-medium text-gray-600 mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

// ==================== MOCK DATA GENERATOR ====================

function generateMockAdmissions(): AdmissionCard[] {
  const coordinators = ['Sarah Chen', 'Mike Johnson', 'Emily Rodriguez', 'David Kim'];
  const payers = [
    { name: 'Medicare Part A', type: 'Medicare' as const },
    { name: 'Medicaid', type: 'Medicaid' as const },
    { name: 'Blue Cross Blue Shield', type: 'Commercial' as const },
    { name: 'United Healthcare', type: 'Commercial' as const },
    { name: 'Aetna', type: 'Commercial' as const },
  ];
  
  const patients = [
    'Mary Johnson', 'Robert Smith', 'Patricia Williams', 'Michael Brown',
    'Linda Davis', 'William Miller', 'Barbara Wilson', 'Richard Moore',
    'Susan Taylor', 'Joseph Anderson', 'Jessica Thomas', 'Charles Jackson',
  ];

  const stages: PipelineStage[] = ['new_referral', 'admission_setup', 'pending_authorization', 'ready_for_care', 'admitted'];
  const readinessStates: ReadinessState[] = ['draft', 'pending_setup', 'blocked', 'ready_for_care'];
  const priorities = ['low', 'medium', 'high', 'urgent'] as const;
  const serviceTypes = ['Home Health', 'Hospice'] as const;

  return Array.from({ length: 24 }, (_, i) => {
    const payer = payers[Math.floor(Math.random() * payers.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const readiness = stage === 'ready_for_care' || stage === 'admitted' 
      ? 'ready_for_care' 
      : readinessStates[Math.floor(Math.random() * readinessStates.length)];
    const hasBlockers = readiness === 'blocked';
    
    return {
      id: `ADM-${2024001 + i}`,
      patient_id: `PAT-${1000 + i}`,
      patient_name: patients[i % patients.length],
      patient_mrn: `MRN${10000 + i}`,
      admission_date: new Date(2024, 2, 1 + i).toISOString().split('T')[0],
      start_of_care_date: stage !== 'new_referral' ? new Date(2024, 2, 5 + i).toISOString().split('T')[0] : undefined,
      service_type: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
      primary_payer: payer.name,
      payer_type: payer.type,
      assigned_coordinator: coordinators[i % coordinators.length],
      coordinator_id: `COORD-${i % coordinators.length}`,
      stage,
      readiness_status: readiness,
      readiness_progress: hasBlockers ? 30 : stage === 'ready_for_care' ? 100 : Math.floor(Math.random() * 80) + 20,
      days_in_stage: Math.floor(Math.random() * 10) + 1,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      has_blockers: hasBlockers,
      blocker_count: hasBlockers ? Math.floor(Math.random() * 3) + 1 : 0,
      referral_source: 'Hospital Discharge',
      referral_date: new Date(2024, 2, 1 + i).toISOString().split('T')[0],
      created_at: new Date(2024, 2, 1 + i).toISOString(),
      updated_at: new Date(2024, 2, 1 + i).toISOString(),
    };
  });
}
