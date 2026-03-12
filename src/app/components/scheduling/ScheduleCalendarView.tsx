/**
 * Schedule Calendar View
 * Displays visits in a calendar format (day/week/month)
 * Fetches live data from the scheduling backend.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, MapPin, User, Phone, Loader2, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { supabase, publicAnonKey, API_BASE } from '../../lib/supabaseClient';
import RecurrenceBadge from './RecurrenceBadge';
import RecurrenceEditDialog, { type RecurrenceScope, type RecurrenceFieldUpdates } from './RecurrenceEditDialog';
import { evvGateway } from '../../lib/dataGateway';

interface ScheduleCalendarViewProps {
  view: 'day' | 'week' | 'month';
  selectedDate: Date;
  filters: {
    office: string;
    discipline: string;
    clinician: string;
    status: string;
  };
  refreshKey?: number;
}

interface Visit {
  id: string;
  patient_name: string;
  patient_id: string;
  start_time: string;
  end_time: string;
  visit_date: string;
  discipline: string;
  visit_type: string;
  caregiver_id: string | null;
  patient_address: string;
  patient_phone: string;
  patient_mrn: string;
  status: string;
  notes: string;
  // Recurrence fields
  recurrence_id?: string;
  recurrence_index?: number;
  recurrence_total?: number;
  recurrence_pattern?: any;
}

export default function ScheduleCalendarView({ view, selectedDate, filters, refreshKey }: ScheduleCalendarViewProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  // Recurrence edit dialog state
  const [recurrenceDialogOpen, setRecurrenceDialogOpen] = useState(false);
  const [recurrenceDialogAction, setRecurrenceDialogAction] = useState<'edit' | 'cancel'>('edit');
  const [recurrenceDialogVisit, setRecurrenceDialogVisit] = useState<Visit | null>(null);
  const [recurrenceLoading, setRecurrenceLoading] = useState(false);
  const [localRefresh, setLocalRefresh] = useState(0);

  const handleVisitClick = useCallback((visit: Visit) => {
    if (visit.recurrence_id) {
      setRecurrenceDialogVisit(visit);
      setRecurrenceDialogAction('edit');
      setRecurrenceDialogOpen(true);
    }
  }, []);

  const handleRecurrenceConfirm = useCallback(async (scope: RecurrenceScope, updates?: RecurrenceFieldUpdates) => {
    if (!recurrenceDialogVisit?.recurrence_id) return;
    setRecurrenceLoading(true);
    try {
      if (recurrenceDialogAction === 'cancel') {
        const result = await evvGateway.cancelRecurrenceVisits(
          recurrenceDialogVisit.id,
          recurrenceDialogVisit.recurrence_id,
          scope,
        );
        toast.success(`Cancelled ${result.cancelled} visit(s) in the series`);
      } else {
        // Map field updates to Visit partial for the gateway
        const visitUpdates: Record<string, any> = {};
        if (updates?.startTime) visitUpdates.startTime = updates.startTime;
        if (updates?.endTime) visitUpdates.endTime = updates.endTime;
        if (updates?.caregiverName) visitUpdates.caregiverName = updates.caregiverName;
        if (updates?.discipline) visitUpdates.discipline = updates.discipline;
        if (updates?.notes) visitUpdates.notes = updates.notes;

        if (Object.keys(visitUpdates).length > 0) {
          const result = await evvGateway.updateRecurrenceVisits(
            recurrenceDialogVisit.id,
            recurrenceDialogVisit.recurrence_id,
            visitUpdates,
            scope,
          );
          toast.success(`Updated ${result.updated} visit(s) in the series`);
        } else {
          toast.info('No changes detected');
        }
      }
      setRecurrenceDialogOpen(false);
      setLocalRefresh(prev => prev + 1);
    } catch (err: any) {
      console.error('[ScheduleCalendarView] Recurrence action error:', err);
      toast.error('Failed to update recurring visits');
    } finally {
      setRecurrenceLoading(false);
    }
  }, [recurrenceDialogVisit, recurrenceDialogAction]);

  // Compute date range based on view
  const dateRange = useMemo(() => {
    if (view === 'day') {
      const d = selectedDate.toISOString().split('T')[0];
      return { start: d, end: d };
    }
    if (view === 'week') {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
    // month
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }, [view, selectedDate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token || publicAnonKey;
        let url = `${API_BASE}/visits?start_date=${dateRange.start}&end_date=${dateRange.end}`;
        if (filters.status && filters.status !== 'all') url += `&status=${filters.status}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          let data = json.data || [];
          // client-side discipline filter
          if (filters.discipline && filters.discipline !== 'all') {
            data = data.filter((v: any) => v.discipline === filters.discipline);
          }
          setVisits(data);
        }
      } catch (err) {
        console.error('[ScheduleCalendarView] Error loading visits:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dateRange.start, dateRange.end, filters.status, filters.discipline, refreshKey, localRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'missed': case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'open': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisciplineColor = (discipline: string) => {
    const colors: Record<string, string> = {
      RN: 'bg-blue-100 text-blue-800',
      PT: 'bg-green-100 text-green-800',
      OT: 'bg-purple-100 text-purple-800',
      ST: 'bg-pink-100 text-pink-800',
      MSW: 'bg-orange-100 text-orange-800',
      AIDE: 'bg-gray-100 text-gray-800',
    };
    return colors[discipline] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-500">Loading schedule...</span>
        </CardContent>
      </Card>
    );
  }

  // ── DAY VIEW ──
  if (view === 'day') {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            {hours.map(hour => {
              const hourVisits = visits.filter(v => {
                const visitHour = parseInt(v.start_time.split(':')[0]);
                return visitHour === hour;
              });

              return (
                <div key={hour} className="flex gap-4 min-h-[80px] border-b pb-2">
                  <div className="w-20 text-sm font-medium text-gray-600 pt-2">
                    {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 ${hour === 12 ? 'PM' : 'AM'}`}
                  </div>
                  <div className="flex-1 space-y-2">
                    {hourVisits.length === 0 ? (
                      <div className="h-full flex items-center text-sm text-gray-400">
                        No visits scheduled
                      </div>
                    ) : (
                      hourVisits.map(visit => (
                        <div
                          key={visit.id}
                          className={`p-3 border-l-4 ${visit.recurrence_id ? 'border-indigo-500' : 'border-blue-600'} bg-blue-50 rounded cursor-pointer hover:bg-blue-100 transition-colors`}
                          onClick={() => handleVisitClick(visit)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getDisciplineColor(visit.discipline)}>
                                {visit.discipline}
                              </Badge>
                              <span className="font-semibold text-gray-900">{visit.patient_name}</span>
                              {visit.patient_mrn && (
                                <span className="text-xs text-gray-500 font-mono">{visit.patient_mrn}</span>
                              )}
                              {visit.recurrence_id && visit.recurrence_index != null && visit.recurrence_total && (
                                <RecurrenceBadge
                                  recurrenceIndex={visit.recurrence_index}
                                  recurrenceTotal={visit.recurrence_total}
                                />
                              )}
                            </div>
                            <Badge className={getStatusColor(visit.status)}>
                              {visit.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="size-3" />
                              <span>{formatTime(visit.start_time)} – {formatTime(visit.end_time)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="size-3" />
                              <span>{visit.visit_type}</span>
                            </div>
                            {visit.patient_address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                <span className="truncate">{visit.patient_address}</span>
                              </div>
                            )}
                            {visit.patient_phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="size-3" />
                                <span>{visit.patient_phone}</span>
                              </div>
                            )}
                          </div>
                          {visit.notes && (
                            <div className="mt-1 text-xs text-gray-500 italic">{visit.notes}</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── WEEK VIEW ──
  if (view === 'week') {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 divide-x">
            {weekDays.map((day, index) => {
              const isToday = day.toDateString() === new Date().toDateString();
              const dayStr = day.toISOString().split('T')[0];
              const dayVisits = visits.filter(v => v.visit_date === dayStr);

              return (
                <div key={index} className="min-h-[600px]">
                  <div className={`p-3 border-b text-center ${isToday ? 'bg-blue-50' : ''}`}>
                    <div className="text-xs font-medium text-gray-600">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </div>
                    {dayVisits.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">{dayVisits.length} visit{dayVisits.length !== 1 ? 's' : ''}</div>
                    )}
                  </div>
                  <div className="p-2 space-y-2">
                    {dayVisits.map(visit => (
                      <div
                        key={visit.id}
                        className={`p-2 ${visit.recurrence_id ? 'bg-indigo-50 border-indigo-200' : 'bg-blue-50 border-blue-200'} border rounded text-xs cursor-pointer hover:bg-blue-100`}
                        onClick={() => handleVisitClick(visit)}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="size-3" />
                          <span className="font-semibold">{formatTime(visit.start_time)}</span>
                          {visit.recurrence_id && (
                            <RecurrenceBadge
                              recurrenceIndex={visit.recurrence_index ?? 0}
                              recurrenceTotal={visit.recurrence_total ?? 1}
                              compact
                            />
                          )}
                        </div>
                        <div className="font-medium text-gray-900 mb-1 truncate">{visit.patient_name}</div>
                        <div className="flex items-center gap-1">
                          <Badge className={getDisciplineColor(visit.discipline)} style={{ fontSize: '9px' }}>
                            {visit.discipline}
                          </Badge>
                          <Badge className={getStatusColor(visit.status)} style={{ fontSize: '9px' }}>
                            {visit.status === 'open' ? 'OPEN' : ''}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {dayVisits.length === 0 && (
                      <div className="text-center text-xs text-gray-400 pt-4">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── MONTH VIEW ──
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-cols-7">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="p-2 text-center text-xs font-semibold text-gray-600 border-b bg-gray-50">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="min-h-[100px] border-b border-r bg-gray-50" />;
            const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayVisits = visits.filter(v => v.visit_date === dayStr);
            const isToday = dayStr === new Date().toISOString().split('T')[0];

            return (
              <div key={i} className={`min-h-[100px] border-b border-r p-1 ${isToday ? 'bg-blue-50' : ''}`}>
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day}
                </div>
                {dayVisits.length > 0 && (
                  <div className="space-y-0.5">
                    {dayVisits.slice(0, 3).map(v => (
                      <div
                        key={v.id}
                        className={`text-[10px] p-0.5 ${v.recurrence_id ? 'bg-indigo-100' : 'bg-blue-100'} rounded truncate cursor-pointer hover:opacity-80`}
                        onClick={() => handleVisitClick(v)}
                      >
                        {v.recurrence_id && <Repeat className="size-2.5 inline mr-0.5" />}
                        {v.start_time} {v.patient_name?.split(',')[0]}
                      </div>
                    ))}
                    {dayVisits.length > 3 && (
                      <div className="text-[10px] text-blue-600 font-medium">+{dayVisits.length - 3} more</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Recurrence Edit Dialog — rendered once, shared across all views */}
      {recurrenceDialogVisit && recurrenceDialogVisit.recurrence_id && (
        <RecurrenceEditDialog
          open={recurrenceDialogOpen}
          onOpenChange={setRecurrenceDialogOpen}
          action={recurrenceDialogAction}
          visitInfo={{
            id: recurrenceDialogVisit.id,
            recurrenceId: recurrenceDialogVisit.recurrence_id,
            recurrenceIndex: recurrenceDialogVisit.recurrence_index ?? 0,
            recurrenceTotal: recurrenceDialogVisit.recurrence_total ?? 1,
            visitDate: recurrenceDialogVisit.visit_date,
            patientName: recurrenceDialogVisit.patient_name,
            visitType: recurrenceDialogVisit.visit_type,
          }}
          onConfirm={handleRecurrenceConfirm}
          loading={recurrenceLoading}
        />
      )}
    </Card>
  );
}