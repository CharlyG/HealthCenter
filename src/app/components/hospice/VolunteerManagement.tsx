/**
 * Volunteer Management Component
 * Track volunteer visits and hours with CMS 5% compliance monitoring.
 * Wired to backend: GET /hospice/volunteers, POST /volunteers, POST /volunteers/:id/visits
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  HandHeart,
  Clock,
  Calendar,
  CheckCircle2,
  User,
  Plus,
  Eye,
  ChevronRight,
  Phone,
  BarChart3,
  RefreshCw,
  X,
  MapPin,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CompactTable, type CompactColumn } from '../design-system/CompactTable';
import { MetricCard } from '../design-system/MetricCard';
import { Progress } from '../ui/progress';
import { LoadingState } from '../design-system/LoadingState';
import { fetchVolunteers, createVolunteer, logVolunteerVisit } from '../../lib/hospiceApi';
import { toast } from 'sonner';

type VolunteerStatus = 'active' | 'inactive' | 'on_leave';
type VisitStatus = 'completed' | 'scheduled' | 'cancelled' | 'no_show';

interface VolunteerVisit {
  id: string;
  date: string;
  patientName: string;
  mrn: string;
  duration: number;
  visitType: string;
  status: VisitStatus;
  notes?: string;
}

interface Volunteer {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: VolunteerStatus;
  startDate: string;
  totalHoursYTD: number;
  monthlyTarget: number;
  hoursThisMonth: number;
  skills: string[];
  assignedPatients: number;
  recentVisits: VolunteerVisit[];
}

const volunteerStatusConfig: Record<VolunteerStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-50 text-green-700 border-green-200' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  on_leave: { label: 'On Leave', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const visitStatusConfig: Record<VisitStatus, { label: string; color: string }> = {
  completed: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  no_show: { label: 'No Show', color: 'bg-red-50 text-red-700 border-red-200' },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const formatDateLong = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatHours = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

interface LogVisitForm {
  date: string;
  patientName: string;
  mrn: string;
  duration: number;
  visitType: string;
  notes: string;
}

const defaultLogVisit: LogVisitForm = {
  date: new Date().toISOString().split('T')[0],
  patientName: '', mrn: '', duration: 60, visitType: 'Companionship', notes: '',
};

export const VolunteerManagement = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedVolunteer, setExpandedVolunteer] = useState<string | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add volunteer modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({
    name: '', phone: '', email: '', skills: '' as string, monthlyTarget: 12,
  });

  // Log visit modal
  const [showLogVisit, setShowLogVisit] = useState<string | null>(null); // volunteer id
  const [loggingVisit, setLoggingVisit] = useState(false);
  const [visitForm, setVisitForm] = useState<LogVisitForm>(defaultLogVisit);

  // Detail view
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  const loadVolunteers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVolunteers({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setVolunteers(data);
    } catch (err: any) {
      console.error('[VolunteerManagement] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(loadVolunteers, 300);
    return () => clearTimeout(debounce);
  }, [loadVolunteers]);

  const handleAddVolunteer = useCallback(async () => {
    if (!newVolunteer.name || !newVolunteer.email) return;
    setCreating(true);
    try {
      await createVolunteer({
        name: newVolunteer.name,
        phone: newVolunteer.phone,
        email: newVolunteer.email,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        totalHoursYTD: 0,
        monthlyTarget: newVolunteer.monthlyTarget,
        hoursThisMonth: 0,
        skills: newVolunteer.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        assignedPatients: 0,
        recentVisits: [],
      });
      toast.success('Volunteer added successfully');
      setShowAddModal(false);
      setNewVolunteer({ name: '', phone: '', email: '', skills: '', monthlyTarget: 12 });
      await loadVolunteers();
    } catch (err: any) {
      console.error('[VolunteerManagement] Create error:', err);
      toast.error('Failed to add volunteer');
    } finally {
      setCreating(false);
    }
  }, [newVolunteer, loadVolunteers]);

  const handleLogVisit = useCallback(async () => {
    if (!showLogVisit || !visitForm.patientName || !visitForm.date) {
      toast.error('Please fill in patient name and date');
      return;
    }
    setLoggingVisit(true);
    try {
      await logVolunteerVisit(showLogVisit, {
        date: visitForm.date,
        patientName: visitForm.patientName,
        mrn: visitForm.mrn || 'N/A',
        duration: visitForm.duration,
        visitType: visitForm.visitType,
        notes: visitForm.notes,
        status: 'completed',
      });
      toast.success(`Visit logged: ${formatHours(visitForm.duration)} with ${visitForm.patientName}`);
      setShowLogVisit(null);
      setVisitForm(defaultLogVisit);
      await loadVolunteers();
    } catch (err: any) {
      console.error('[VolunteerManagement] Log visit error:', err);
      toast.error('Failed to log visit');
    } finally {
      setLoggingVisit(false);
    }
  }, [showLogVisit, visitForm, loadVolunteers]);

  const metrics = useMemo(() => {
    const active = volunteers.filter((v) => v.status === 'active');
    const totalHoursThisMonth = active.reduce((s, v) => s + v.hoursThisMonth, 0);
    const totalTarget = active.reduce((s, v) => s + v.monthlyTarget, 0);
    const totalPatientCareHours = 880; // clinical staff hours this month
    const volunteerPct = totalPatientCareHours > 0 ? parseFloat(((totalHoursThisMonth / totalPatientCareHours) * 100).toFixed(1)) : 0;
    return {
      activeCount: active.length,
      totalHoursMonth: totalHoursThisMonth,
      totalTarget,
      volunteerPct,
      onLeave: volunteers.filter((v) => v.status === 'on_leave').length,
    };
  }, [volunteers]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedVolunteer((prev) => (prev === id ? null : id));
  }, []);

  const visitColumns: CompactColumn<VolunteerVisit>[] = useMemo(() => [
    { key: 'date', header: 'Date', render: (item) => <span className="text-xs text-gray-600">{formatDate(item.date)}</span> },
    {
      key: 'patient', header: 'Patient',
      render: (item) => (
        <div>
          <div className="text-xs font-medium text-gray-900">{item.patientName}</div>
          <div className="text-[10px] text-gray-500">{item.mrn}</div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (item) => <span className="text-xs text-gray-700">{item.visitType}</span> },
    { key: 'duration', header: 'Duration', align: 'center' as const, render: (item) => <span className="text-xs text-gray-600">{formatHours(item.duration)}</span> },
    {
      key: 'status', header: 'Status', align: 'center' as const,
      render: (item) => {
        const cfg = visitStatusConfig[item.status];
        return <Badge className={`${cfg?.color} text-[10px]`}>{cfg?.label}</Badge>;
      },
    },
  ], []);

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Active Volunteers" value={metrics.activeCount} icon={<HandHeart className="size-5" />} />
        <MetricCard title="Hours This Month" value={metrics.totalHoursMonth} subtitle={`Target: ${metrics.totalTarget}h`} icon={<Clock className="size-5" />} />
        <MetricCard
          title="5% Requirement"
          value={`${metrics.volunteerPct}%`}
          subtitle={metrics.volunteerPct >= 5 ? 'Compliant' : 'Below threshold'}
          icon={<BarChart3 className="size-5" />}
          variant={metrics.volunteerPct >= 5 ? 'success' : 'danger'}
        />
        <MetricCard title="On Leave" value={metrics.onLeave} icon={<Calendar className="size-5" />} />
      </div>

      {/* CMS 5% Compliance Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">CMS 5% Volunteer Hour Requirement</div>
            <div className={`text-sm font-semibold ${metrics.volunteerPct >= 5 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.volunteerPct}% of patient care hours
            </div>
          </div>
          <div className="relative">
            <Progress value={Math.min(metrics.volunteerPct * 20, 100)} className="h-3" />
            {/* 5% marker */}
            <div className="absolute top-0 left-[100%] h-3 w-0.5 bg-gray-400" style={{ left: '100%' }} />
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
            <span>0%</span>
            <span className="text-rose-600 font-semibold">5% minimum</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search volunteers..." className="pl-9 w-56 h-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-9" onClick={loadVolunteers}><RefreshCw className="size-3" /></Button>
        </div>
        <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => setShowAddModal(true)}><Plus className="size-4 mr-1" />Add Volunteer</Button>
      </div>

      {/* Volunteer List */}
      {loading ? (
        <LoadingState message="Loading volunteers..." />
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-sm mb-2">{error}</p>
          <Button size="sm" variant="outline" onClick={loadVolunteers}>Retry</Button>
        </div>
      ) : volunteers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <HandHeart className="size-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-1">No volunteers found</p>
            <p className="text-sm">Adjust filters or add a new volunteer</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {volunteers.map((vol) => {
            const sCfg = volunteerStatusConfig[vol.status] || volunteerStatusConfig.active;
            const isExpanded = expandedVolunteer === vol.id;
            const hourPct = vol.monthlyTarget > 0 ? Math.min(Math.round((vol.hoursThisMonth / vol.monthlyTarget) * 100), 100) : 0;
            const belowTarget = vol.status === 'active' && vol.hoursThisMonth < vol.monthlyTarget * 0.5;
            const completedVisits = vol.recentVisits?.filter((v) => v.status === 'completed').length || 0;
            const scheduledVisits = vol.recentVisits?.filter((v) => v.status === 'scheduled').length || 0;

            return (
              <Card key={vol.id} className={`transition-shadow hover:shadow-sm ${belowTarget ? 'border-amber-200' : ''}`}>
                <button className="w-full text-left px-4 py-3 flex items-center gap-4" onClick={() => toggleExpand(vol.id)}>
                  <ChevronRight className={`size-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div className="size-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm">
                      {vol.name.split(',')[0][0]}{vol.name.split(' ')[1]?.[0] || ''}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{vol.name}</div>
                      <div className="text-xs text-gray-500">Since {formatDate(vol.startDate)}</div>
                    </div>
                  </div>
                  <Badge className={`${sCfg.color} text-[10px]`}>{sCfg.label}</Badge>
                  <div className="hidden md:flex items-center gap-1 flex-wrap max-w-[200px]">
                    {vol.skills?.slice(0, 2).map((s) => (
                      <Badge key={s} className="bg-gray-50 text-gray-600 border-gray-200 text-[10px]">{s}</Badge>
                    ))}
                    {(vol.skills?.length || 0) > 2 && <span className="text-[10px] text-gray-400">+{vol.skills.length - 2}</span>}
                  </div>
                  <div className="flex-1 max-w-[160px] hidden lg:block">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{vol.hoursThisMonth}h / {vol.monthlyTarget}h</span>
                      <span className={hourPct >= 80 ? 'text-green-600' : hourPct >= 50 ? 'text-amber-600' : 'text-red-600'}>{hourPct}%</span>
                    </div>
                    <Progress value={hourPct} className="h-1.5" />
                  </div>
                  <div className="text-xs text-gray-500 hidden xl:block">{vol.assignedPatients} patients</div>
                  <div className="text-xs text-gray-500 hidden xl:block min-w-[70px] text-right">{vol.totalHoursYTD}h YTD</div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
                    {/* Contact info */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-600 bg-white border border-gray-200 rounded-md p-2.5">
                      <span className="flex items-center gap-1"><Phone className="size-3" /> {vol.phone}</span>
                      <span className="flex items-center gap-1"><Mail className="size-3" /> {vol.email}</span>
                      <span className="flex items-center gap-1 flex-wrap">Skills: {vol.skills?.join(', ')}</span>
                      <div className="ml-auto flex items-center gap-2 text-[10px]">
                        <Badge className="bg-green-50 text-green-700 border-green-200">{completedVisits} completed</Badge>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">{scheduledVisits} scheduled</Badge>
                      </div>
                    </div>

                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Recent & Upcoming Visits</h4>
                    <CompactTable data={vol.recentVisits || []} columns={visitColumns} keyExtractor={(item) => item.id} emptyMessage="No recent visits" striped />

                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLogVisit(vol.id);
                          setVisitForm(defaultLogVisit);
                        }}
                      >
                        <Plus className="size-3 mr-1" />Log Visit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVolunteer(vol);
                        }}
                      >
                        <Eye className="size-3 mr-1" />Full Profile
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Add Volunteer Modal ─────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[450px] max-w-[90vw] shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <HandHeart className="size-4 text-rose-600" />
                  Add New Volunteer
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}><X className="size-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Full Name *</label>
                <Input className="h-9 text-sm" placeholder="Last, First" value={newVolunteer.name} onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Phone</label>
                  <Input className="h-9 text-sm" placeholder="(555) 000-0000" value={newVolunteer.phone} onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Email *</label>
                  <Input className="h-9 text-sm" placeholder="email@example.com" value={newVolunteer.email} onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Skills (comma-separated)</label>
                <Input className="h-9 text-sm" placeholder="Companionship, Music Therapy, Vigil" value={newVolunteer.skills} onChange={(e) => setNewVolunteer({ ...newVolunteer, skills: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Monthly Hour Target</label>
                <Input type="number" className="h-9 text-sm w-32" value={newVolunteer.monthlyTarget} onChange={(e) => setNewVolunteer({ ...newVolunteer, monthlyTarget: parseInt(e.target.value, 10) || 12 })} />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button size="sm" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={handleAddVolunteer} disabled={creating || !newVolunteer.name || !newVolunteer.email}>
                  {creating ? <RefreshCw className="size-3 animate-spin" /> : <Plus className="size-3 mr-1" />}
                  Add Volunteer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Log Visit Modal ─────────────────────────────────────────────── */}
      {showLogVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[480px] max-w-[90vw] shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="size-4 text-rose-600" />
                    Log Volunteer Visit
                  </CardTitle>
                  <CardDescription>
                    For: {volunteers.find((v) => v.id === showLogVisit)?.name}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowLogVisit(null)}><X className="size-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Visit Date *</label>
                  <input type="date" className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm h-9" value={visitForm.date} onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Visit Type</label>
                  <Select value={visitForm.visitType} onValueChange={(v) => setVisitForm({ ...visitForm, visitType: v })}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Companionship">Companionship</SelectItem>
                      <SelectItem value="Vigil">Vigil</SelectItem>
                      <SelectItem value="Music Therapy">Music Therapy</SelectItem>
                      <SelectItem value="Pet Therapy">Pet Therapy</SelectItem>
                      <SelectItem value="Hair Care / Crafts">Hair Care / Crafts</SelectItem>
                      <SelectItem value="Respite Care">Respite Care</SelectItem>
                      <SelectItem value="Errands">Errands</SelectItem>
                      <SelectItem value="Administrative">Administrative</SelectItem>
                      <SelectItem value="Bereavement Support">Bereavement Support</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Patient Name *</label>
                  <Input className="h-9 text-sm" placeholder="Last, First" value={visitForm.patientName} onChange={(e) => setVisitForm({ ...visitForm, patientName: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">MRN</label>
                  <Input className="h-9 text-sm" placeholder="MRN-XXXX" value={visitForm.mrn} onChange={(e) => setVisitForm({ ...visitForm, mrn: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Duration (minutes)</label>
                <div className="flex items-center gap-2">
                  <Input type="number" className="h-9 text-sm w-24" value={visitForm.duration} onChange={(e) => setVisitForm({ ...visitForm, duration: parseInt(e.target.value, 10) || 0 })} />
                  <span className="text-xs text-gray-500">= {formatHours(visitForm.duration)}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    {[30, 60, 90, 120, 180].map((d) => (
                      <Button key={d} size="sm" variant={visitForm.duration === d ? 'default' : 'outline'} className={`h-7 text-[10px] px-2 ${visitForm.duration === d ? 'bg-rose-600 hover:bg-rose-700' : ''}`} onClick={() => setVisitForm({ ...visitForm, duration: d })}>
                        {formatHours(d)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Notes</label>
                <textarea
                  className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm min-h-[60px] resize-y"
                  placeholder="Visit notes, activities, patient response..."
                  value={visitForm.notes}
                  onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button size="sm" variant="outline" onClick={() => setShowLogVisit(null)}>Cancel</Button>
                <Button
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700"
                  onClick={handleLogVisit}
                  disabled={loggingVisit || !visitForm.patientName || !visitForm.date}
                >
                  {loggingVisit ? <><RefreshCw className="size-3 mr-1 animate-spin" />Logging...</> : <><CheckCircle2 className="size-3 mr-1" />Log Visit</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Volunteer Detail Modal ──────────────────────────────────────── */}
      {selectedVolunteer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedVolunteer(null)}>
          <Card className="w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
                    {selectedVolunteer.name.split(',')[0][0]}{selectedVolunteer.name.split(' ')[1]?.[0] || ''}
                  </div>
                  <div>
                    <CardTitle className="text-base">{selectedVolunteer.name}</CardTitle>
                    <CardDescription>Active since {formatDateLong(selectedVolunteer.startDate)}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedVolunteer(null)}><X className="size-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold text-rose-600">{selectedVolunteer.totalHoursYTD}h</div>
                  <div className="text-xs text-gray-500">YTD Hours</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedVolunteer.hoursThisMonth}h</div>
                  <div className="text-xs text-gray-500">This Month ({selectedVolunteer.monthlyTarget}h target)</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedVolunteer.assignedPatients}</div>
                  <div className="text-xs text-gray-500">Assigned Patients</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="font-medium">{selectedVolunteer.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-medium">{selectedVolunteer.email}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Skills</div>
                <div className="flex flex-wrap gap-1">
                  {selectedVolunteer.skills?.map((s) => (
                    <Badge key={s} className="bg-rose-50 text-rose-700 border-rose-200 text-xs">{s}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Visit History ({selectedVolunteer.recentVisits?.length || 0})</h4>
                <CompactTable data={selectedVolunteer.recentVisits || []} columns={visitColumns} keyExtractor={(item) => item.id} emptyMessage="No visits recorded" striped />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});

VolunteerManagement.displayName = 'VolunteerManagement';
