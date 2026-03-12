/**
 * Schedule List View
 * Displays visits in a sortable, filterable table – fetches live data.
 */
import { useState, useEffect, useCallback } from 'react';
import { Clock, MapPin, User, Phone, Edit2, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CompactTable } from '../design-system/CompactTable';
import { supabase, publicAnonKey, API_BASE } from '../../lib/supabaseClient';
import RecurrenceBadge from './RecurrenceBadge';
import RecurrenceEditDialog, { type RecurrenceScope, type RecurrenceFieldUpdates } from './RecurrenceEditDialog';
import { evvGateway } from '../../lib/dataGateway';

interface ScheduleListViewProps {
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
  visit_date: string;
  start_time: string;
  end_time: string;
  patient_name: string;
  patient_id: string;
  patient_mrn: string;
  discipline: string;
  visit_type: string;
  patient_address: string;
  patient_phone: string;
  status: string;
  notes: string;
  recurrence_id?: string;
  recurrence_index?: number;
  recurrence_total?: number;
  recurrence_pattern?: any;
}

export default function ScheduleListView({ selectedDate, filters, refreshKey }: ScheduleListViewProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  // Recurrence dialog state
  const [recurrenceDialogOpen, setRecurrenceDialogOpen] = useState(false);
  const [recurrenceDialogAction, setRecurrenceDialogAction] = useState<'edit' | 'cancel'>('edit');
  const [recurrenceDialogVisit, setRecurrenceDialogVisit] = useState<Visit | null>(null);
  const [recurrenceLoading, setRecurrenceLoading] = useState(false);
  const [localRefresh, setLocalRefresh] = useState(0);

  const openRecurrenceDialog = useCallback((visit: Visit, action: 'edit' | 'cancel') => {
    setRecurrenceDialogVisit(visit);
    setRecurrenceDialogAction(action);
    setRecurrenceDialogOpen(true);
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
    } catch (err) {
      console.error('[ScheduleListView] Recurrence action error:', err);
      toast.error('Failed to update recurring visits');
    } finally {
      setRecurrenceLoading(false);
    }
  }, [recurrenceDialogVisit, recurrenceDialogAction]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token || publicAnonKey;

        // Fetch a 7-day window from selectedDate
        const start = new Date(selectedDate);
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        let url = `${API_BASE}/visits?start_date=${start.toISOString().split('T')[0]}&end_date=${end.toISOString().split('T')[0]}`;
        if (filters.status && filters.status !== 'all') url += `&status=${filters.status}`;

        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          let data = json.data || [];
          if (filters.discipline && filters.discipline !== 'all') {
            data = data.filter((v: any) => v.discipline === filters.discipline);
          }
          setVisits(data);
        }
      } catch (err) {
        console.error('[ScheduleListView] Error loading visits:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedDate, filters.status, filters.discipline, refreshKey, localRefresh]);

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
          <span className="ml-3 text-gray-500">Loading visits...</span>
        </CardContent>
      </Card>
    );
  }

  const columns = [
    {
      key: 'datetime',
      header: 'Date & Time',
      render: (visit: Visit) => (
        <div>
          <div className="font-semibold text-gray-900">{visit.visit_date}</div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="size-3" />
            {formatTime(visit.start_time)} – {formatTime(visit.end_time)}
          </div>
        </div>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (visit: Visit) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{visit.patient_name}</span>
            {visit.recurrence_id && visit.recurrence_index != null && visit.recurrence_total && (
              <RecurrenceBadge
                recurrenceIndex={visit.recurrence_index}
                recurrenceTotal={visit.recurrence_total}
              />
            )}
          </div>
          {visit.patient_phone && (
            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Phone className="size-3" />
              {visit.patient_phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'discipline',
      header: 'Discipline',
      render: (visit: Visit) => (
        <Badge className={getDisciplineColor(visit.discipline)}>
          {visit.discipline}
        </Badge>
      ),
    },
    {
      key: 'type',
      header: 'Visit Type',
      render: (visit: Visit) => (
        <div className="flex items-center gap-2">
          <User className="size-4 text-gray-400" />
          <span>{visit.visit_type}</span>
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Address',
      render: (visit: Visit) => (
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-gray-400" />
          <span className="text-sm truncate max-w-[200px]">{visit.patient_address || '—'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (visit: Visit) => (
        <Badge className={getStatusColor(visit.status)}>
          {visit.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (visit: Visit) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            title={visit.recurrence_id ? 'Edit recurring visit' : 'Edit visit'}
            onClick={() => {
              if (visit.recurrence_id) {
                openRecurrenceDialog(visit, 'edit');
              }
            }}
          >
            <Edit2 className="size-4" />
          </Button>
          {visit.status === 'scheduled' && (
            <Button variant="ghost" size="sm">
              <CheckCircle className="size-4 text-green-600" />
            </Button>
          )}
          {visit.recurrence_id && visit.status === 'scheduled' && (
            <Button
              variant="ghost"
              size="sm"
              title="Cancel recurring visit"
              onClick={() => openRecurrenceDialog(visit, 'cancel')}
            >
              <XCircle className="size-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <CompactTable
          columns={columns}
          data={visits}
          keyExtractor={(visit) => visit.id}
          emptyMessage="No visits scheduled for this period"
        />
      </CardContent>

      {/* Recurrence Edit Dialog */}
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