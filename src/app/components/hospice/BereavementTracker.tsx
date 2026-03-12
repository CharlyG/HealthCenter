/**
 * Bereavement Tracker Component
 * Track bereavement follow-ups and tasks for bereaved families.
 * Wired to backend: GET /hospice/bereavement, PUT /tasks/:id/complete, POST /hospice/bereavement
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  Filter,
  Flower2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  User,
  RefreshCw,
  X,
  FileText,
  Heart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchBereavementCases, completeBereavementTask, createBereavementCase } from '../../lib/hospiceApi';
import { toast } from 'sonner';

type RiskLevel = 'high' | 'moderate' | 'low';
type TaskType = 'phone_call' | 'sympathy_card' | 'home_visit' | 'group_referral' | 'anniversary_card' | 'resource_mailing';
type TaskStatus = 'completed' | 'due' | 'overdue' | 'upcoming';

interface BereavementTask {
  id: string;
  type: TaskType;
  label: string;
  scheduledDate: string;
  status: TaskStatus;
  completedDate?: string;
  completedBy?: string;
  notes?: string;
}

interface BereavementCase {
  id: string;
  deceasedName: string;
  mrn: string;
  dateOfDeath: string;
  primaryContact: string;
  relationship: string;
  contactPhone: string;
  contactEmail?: string;
  riskLevel: RiskLevel;
  monthsInProgram: number;
  totalTasks: number;
  completedTasks: number;
  tasks: BereavementTask[];
  counselor: string;
  notes?: string;
}

const riskConfig: Record<RiskLevel, { label: string; color: string; bgColor: string }> = {
  high: { label: 'High Risk', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
  moderate: { label: 'Moderate', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  low: { label: 'Low Risk', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
};

const taskTypeIcons: Record<TaskType, { icon: React.ReactNode; label: string }> = {
  phone_call: { icon: <Phone className="size-3" />, label: 'Phone Call' },
  sympathy_card: { icon: <Mail className="size-3" />, label: 'Sympathy Card' },
  home_visit: { icon: <MapPin className="size-3" />, label: 'Home Visit' },
  group_referral: { icon: <User className="size-3" />, label: 'Group Referral' },
  anniversary_card: { icon: <Calendar className="size-3" />, label: 'Anniversary Card' },
  resource_mailing: { icon: <Mail className="size-3" />, label: 'Resource Mailing' },
};

const taskStatusConfig: Record<TaskStatus, { label: string; color: string }> = {
  completed: { label: 'Done', color: 'bg-green-50 text-green-700 border-green-200' },
  due: { label: 'Due', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  overdue: { label: 'Overdue', color: 'bg-red-50 text-red-700 border-red-200' },
  upcoming: { label: 'Upcoming', color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// ─── New Case Form State ──────────────────────────────────────────────────────
interface NewCaseForm {
  deceasedName: string;
  mrn: string;
  dateOfDeath: string;
  primaryContact: string;
  relationship: string;
  contactPhone: string;
  contactEmail: string;
  riskLevel: RiskLevel;
  counselor: string;
  notes: string;
}

const defaultNewCase: NewCaseForm = {
  deceasedName: '', mrn: '', dateOfDeath: '', primaryContact: '',
  relationship: '', contactPhone: '', contactEmail: '',
  riskLevel: 'moderate', counselor: '', notes: '',
};

export const BereavementTracker = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [cases, setCases] = useState<BereavementCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  // Create Case Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCase, setNewCase] = useState<NewCaseForm>(defaultNewCase);

  // Detail Drawer
  const [selectedCase, setSelectedCase] = useState<BereavementCase | null>(null);

  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBereavementCases({
        search: searchQuery || undefined,
        riskLevel: riskFilter !== 'all' ? riskFilter : undefined,
      });
      setCases(data);
    } catch (err: any) {
      console.error('[BereavementTracker] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, riskFilter]);

  useEffect(() => {
    const debounce = setTimeout(loadCases, 300);
    return () => clearTimeout(debounce);
  }, [loadCases]);

  const handleCompleteTask = useCallback(async (caseId: string, taskId: string) => {
    setCompletingTask(taskId);
    try {
      await completeBereavementTask(caseId, taskId);
      toast.success('Task marked as complete');
      await loadCases();
    } catch (err: any) {
      console.error('[BereavementTracker] Complete task error:', err);
      toast.error('Failed to complete task');
    } finally {
      setCompletingTask(null);
    }
  }, [loadCases]);

  const handleCreateCase = useCallback(async () => {
    if (!newCase.deceasedName || !newCase.dateOfDeath || !newCase.primaryContact) {
      toast.error('Please fill in required fields');
      return;
    }
    setCreating(true);
    try {
      await createBereavementCase({
        deceasedName: newCase.deceasedName,
        mrn: newCase.mrn || `MRN-B${Date.now().toString().slice(-4)}`,
        dateOfDeath: newCase.dateOfDeath,
        primaryContact: newCase.primaryContact,
        relationship: newCase.relationship || 'Family',
        contactPhone: newCase.contactPhone,
        contactEmail: newCase.contactEmail,
        riskLevel: newCase.riskLevel,
        counselor: newCase.counselor || 'Chen, Lisa (MSW)',
        notes: newCase.notes,
      });
      toast.success('Bereavement case created with 13-month task schedule');
      setShowCreateModal(false);
      setNewCase(defaultNewCase);
      await loadCases();
    } catch (err: any) {
      console.error('[BereavementTracker] Create error:', err);
      toast.error('Failed to create bereavement case');
    } finally {
      setCreating(false);
    }
  }, [newCase, loadCases]);

  const metrics = useMemo(() => {
    const overdueTasks = cases.flatMap((c) => c.tasks || []).filter((t) => t.status === 'overdue').length;
    const dueTasks = cases.flatMap((c) => c.tasks || []).filter((t) => t.status === 'due').length;
    const highRisk = cases.filter((c) => c.riskLevel === 'high').length;
    return { total: cases.length, overdueTasks, dueTasks, highRisk };
  }, [cases]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedCase((prev) => (prev === id ? null : id));
  }, []);

  const updateField = useCallback((field: keyof NewCaseForm, value: string) => {
    setNewCase((prev) => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Active Cases" value={metrics.total} icon={<Flower2 className="size-5" />} />
        <MetricCard title="High Risk" value={metrics.highRisk} icon={<AlertTriangle className="size-5" />} variant="danger" />
        <MetricCard title="Overdue Tasks" value={metrics.overdueTasks} icon={<Clock className="size-5" />} variant="warning" />
        <MetricCard title="Due This Week" value={metrics.dueTasks} icon={<Calendar className="size-5" />} />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search cases..." className="pl-9 w-56 h-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-36 h-9 text-sm"><Filter className="size-3 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-9" onClick={loadCases}><RefreshCw className="size-3" /></Button>
        </div>
        <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => setShowCreateModal(true)}>
          <Plus className="size-4 mr-1" />New Bereavement Case
        </Button>
      </div>

      {/* Case List */}
      {loading ? (
        <LoadingState message="Loading bereavement cases..." />
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-sm mb-2">{error}</p>
          <Button size="sm" variant="outline" onClick={loadCases}>Retry</Button>
        </div>
      ) : cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Flower2 className="size-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-1">No cases found</p>
            <p className="text-sm">Adjust your filters or add a new bereavement case</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {cases.map((bc) => {
            const risk = riskConfig[bc.riskLevel] || riskConfig.low;
            const isExpanded = expandedCase === bc.id;
            const progressPct = bc.totalTasks > 0 ? Math.round((bc.completedTasks / bc.totalTasks) * 100) : 0;
            const hasOverdue = bc.tasks?.some((t) => t.status === 'overdue');
            const pendingTasks = bc.tasks?.filter((t) => t.status === 'due' || t.status === 'overdue') || [];

            return (
              <Card key={bc.id} className={`transition-shadow hover:shadow-sm ${hasOverdue ? 'border-red-200' : ''}`}>
                <button className="w-full text-left px-4 py-3 flex items-center gap-4" onClick={() => toggleExpand(bc.id)}>
                  <ChevronRight className={`size-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  <div className="min-w-[160px]">
                    <div className="font-medium text-gray-900 text-sm">{bc.deceasedName}</div>
                    <div className="text-xs text-gray-500">DOD: {formatDate(bc.dateOfDeath)} · {bc.mrn}</div>
                  </div>
                  <div className="min-w-[140px] hidden md:block">
                    <div className="text-xs text-gray-700">{bc.primaryContact}</div>
                    <div className="text-xs text-gray-400">{bc.relationship} · {bc.contactPhone}</div>
                  </div>
                  <Badge className={`${risk.bgColor} ${risk.color} text-[10px]`}>{risk.label}</Badge>
                  {pendingTasks.length > 0 && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] hidden sm:flex">
                      <Clock className="size-3 mr-0.5" />{pendingTasks.length} pending
                    </Badge>
                  )}
                  <div className="flex-1 max-w-[200px] hidden lg:block">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Month {bc.monthsInProgram}/13</span>
                      <span>{bc.completedTasks}/{bc.totalTasks} tasks</span>
                    </div>
                    <Progress value={progressPct} className="h-1.5" />
                  </div>
                  <div className="text-xs text-gray-500 hidden xl:block min-w-[120px]">{bc.counselor}</div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                    {/* Contact Info Banner */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-600 bg-white border border-gray-200 rounded-md p-2.5">
                      <span className="flex items-center gap-1"><User className="size-3" />{bc.primaryContact} ({bc.relationship})</span>
                      <span className="flex items-center gap-1"><Phone className="size-3" />{bc.contactPhone}</span>
                      {(bc as any).contactEmail && <span className="flex items-center gap-1"><Mail className="size-3" />{(bc as any).contactEmail}</span>}
                      <span className="flex items-center gap-1 ml-auto"><Heart className="size-3 text-rose-500" />Counselor: {bc.counselor}</span>
                    </div>

                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Follow-Up Tasks ({bc.tasks?.length || 0})</h4>
                    <div className="space-y-2">
                      {(bc.tasks || []).map((task) => {
                        const sCfg = taskStatusConfig[task.status] || taskStatusConfig.upcoming;
                        const tCfg = taskTypeIcons[task.type] || { icon: <Calendar className="size-3" />, label: task.type };
                        const isCompleting = completingTask === task.id;
                        return (
                          <div
                            key={task.id}
                            className={`flex items-center gap-3 p-2.5 rounded-md border ${
                              task.status === 'overdue' ? 'bg-red-50/50 border-red-200'
                                : task.status === 'completed' ? 'bg-white border-gray-100 opacity-70'
                                  : task.status === 'due' ? 'bg-amber-50/30 border-amber-200'
                                    : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 text-gray-500">{tCfg.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-800">{task.label}</div>
                              <div className="text-[10px] text-gray-500">
                                {task.status === 'completed'
                                  ? `Completed ${formatDate(task.completedDate!)}${task.completedBy ? ` by ${task.completedBy}` : ''}`
                                  : `Scheduled ${formatDate(task.scheduledDate)}`}
                              </div>
                              {task.notes && <div className="text-[10px] text-gray-400 mt-0.5 italic">{task.notes}</div>}
                            </div>
                            <Badge className={`${sCfg.color} text-[10px]`}>{sCfg.label}</Badge>
                            {(task.status === 'due' || task.status === 'overdue') && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[10px] px-2"
                                disabled={isCompleting}
                                onClick={(e) => { e.stopPropagation(); handleCompleteTask(bc.id, task.id); }}
                              >
                                {isCompleting ? (
                                  <RefreshCw className="size-3 mr-0.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="size-3 mr-0.5" />
                                )}
                                Complete
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{bc.completedTasks} of {bc.totalTasks} tasks completed ({progressPct}%)</span>
                        <span>Month {bc.monthsInProgram} of 13-month program</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedCase(bc); }}>
                        <FileText className="size-3 mr-1" />View Full Record
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Create Case Modal ──────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[560px] max-w-[90vw] max-h-[90vh] overflow-y-auto shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flower2 className="size-4 text-rose-600" />
                    New Bereavement Case
                  </CardTitle>
                  <CardDescription>A 13-month follow-up task schedule will be auto-generated.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}><X className="size-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Deceased Information */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Deceased Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Deceased Name *</label>
                    <Input className="h-9 text-sm" placeholder="Last, First" value={newCase.deceasedName} onChange={(e) => updateField('deceasedName', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">MRN</label>
                    <Input className="h-9 text-sm" placeholder="Auto-generated if blank" value={newCase.mrn} onChange={(e) => updateField('mrn', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Date of Death *</label>
                    <input type="date" className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm h-9" value={newCase.dateOfDeath} onChange={(e) => updateField('dateOfDeath', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Risk Level</label>
                    <Select value={newCase.riskLevel} onValueChange={(v) => updateField('riskLevel', v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Risk</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Primary Contact */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Primary Bereaved Contact</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Contact Name *</label>
                    <Input className="h-9 text-sm" placeholder="Full name" value={newCase.primaryContact} onChange={(e) => updateField('primaryContact', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Relationship</label>
                    <Select value={newCase.relationship || 'Spouse'} onValueChange={(v) => updateField('relationship', v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Child">Child (Adult)</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Other Family">Other Family</SelectItem>
                        <SelectItem value="Friend">Friend / Non-Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Phone</label>
                    <Input className="h-9 text-sm" placeholder="(555) 000-0000" value={newCase.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Email</label>
                    <Input className="h-9 text-sm" placeholder="email@example.com" value={newCase.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Counselor & Notes */}
              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Assignment</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Assigned Counselor</label>
                    <Select value={newCase.counselor || 'Chen, Lisa (MSW)'} onValueChange={(v) => updateField('counselor', v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chen, Lisa (MSW)">Chen, Lisa (MSW)</SelectItem>
                        <SelectItem value="Brown, David">Brown, David</SelectItem>
                        <SelectItem value="Smith, Janet (RN)">Smith, Janet (RN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Notes</label>
                  <textarea
                    className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm min-h-[60px] resize-y"
                    placeholder="Initial observations, special considerations..."
                    value={newCase.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                  />
                </div>
              </div>

              {/* Task Schedule Preview */}
              <div className="bg-rose-50 border border-rose-200 rounded-md p-3">
                <h4 className="text-xs font-semibold text-rose-700 mb-1 flex items-center gap-1">
                  <Calendar className="size-3" />
                  Auto-Generated 13-Month Task Schedule
                </h4>
                <p className="text-[10px] text-rose-600">
                  10 follow-up tasks will be created: initial sympathy card, phone calls at 1 week / 1 month / 2 months / 6 months / 13 months,
                  grief resource packet, 3-month home visit, support group referral, and 1-year anniversary card.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button size="sm" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700"
                  onClick={handleCreateCase}
                  disabled={creating || !newCase.deceasedName || !newCase.dateOfDeath || !newCase.primaryContact}
                >
                  {creating ? <><RefreshCw className="size-3 mr-1 animate-spin" />Creating...</> : <><Plus className="size-3 mr-1" />Create Case</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Detail Drawer ──────────────────────────────────────────────── */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedCase(null)}>
          <Card className="w-[640px] max-w-[90vw] max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Flower2 className="size-4 text-rose-600" />
                    {selectedCase.deceasedName}
                  </CardTitle>
                  <CardDescription>
                    {selectedCase.mrn} · DOD: {formatDate(selectedCase.dateOfDeath)} · Month {selectedCase.monthsInProgram}/13
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCase(null)}><X className="size-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Primary Contact</div>
                  <div className="font-medium">{selectedCase.primaryContact}</div>
                  <div className="text-xs text-gray-500">{selectedCase.relationship} · {selectedCase.contactPhone}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Assigned Counselor</div>
                  <div className="font-medium">{selectedCase.counselor}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Risk Level</div>
                  <Badge className={`${riskConfig[selectedCase.riskLevel].bgColor} ${riskConfig[selectedCase.riskLevel].color} text-xs`}>
                    {riskConfig[selectedCase.riskLevel].label}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Progress</div>
                  <div className="font-medium">{selectedCase.completedTasks}/{selectedCase.totalTasks} tasks complete</div>
                  <Progress value={selectedCase.totalTasks > 0 ? Math.round((selectedCase.completedTasks / selectedCase.totalTasks) * 100) : 0} className="h-1.5 mt-1" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Complete Task Timeline</h4>
                <div className="space-y-1.5">
                  {(selectedCase.tasks || []).map((task) => {
                    const sCfg = taskStatusConfig[task.status] || taskStatusConfig.upcoming;
                    const tCfg = taskTypeIcons[task.type] || { icon: <Calendar className="size-3" />, label: task.type };
                    return (
                      <div key={task.id} className={`flex items-center gap-2 p-2 rounded text-xs border ${
                        task.status === 'completed' ? 'bg-green-50/50 border-green-100' :
                        task.status === 'overdue' ? 'bg-red-50 border-red-200' :
                        task.status === 'due' ? 'bg-amber-50 border-amber-100' :
                        'bg-white border-gray-100'
                      }`}>
                        {tCfg.icon}
                        <span className="flex-1 font-medium">{task.label}</span>
                        <span className="text-gray-500">{task.status === 'completed' ? formatDate(task.completedDate!) : formatDate(task.scheduledDate)}</span>
                        <Badge className={`${sCfg.color} text-[9px]`}>{sCfg.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});

BereavementTracker.displayName = 'BereavementTracker';
