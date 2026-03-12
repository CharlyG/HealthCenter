/**
 * Patient Visits Section
 * Display scheduled and completed visits fetched from the server
 */
import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, User, Loader2, RefreshCw, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { CompactTable } from '../../design-system/CompactTable';
import { visitGateway } from '../../../lib/dataGateway';

interface PatientVisitsProps {
  patientId: string;
  /** When provided, only visits for this admission are shown */
  admissionId?: string;
}

export default function PatientVisits({ patientId, admissionId }: PatientVisitsProps) {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVisits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await visitGateway.getByPatientId(patientId);
      setVisits(data);
    } catch (err) {
      console.error('[PatientVisits] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'missed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (visit: any) => (
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-gray-400" />
          <span>{visit.visitDate}</span>
        </div>
      ),
    },
    {
      key: 'time',
      header: 'Time',
      render: (visit: any) => (
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-gray-400" />
          <span>{visit.startTime} – {visit.endTime}</span>
        </div>
      ),
    },
    {
      key: 'discipline',
      header: 'Discipline',
      render: (visit: any) => (
        <Badge variant="outline">{visit.discipline?.toUpperCase() || '—'}</Badge>
      ),
    },
    {
      key: 'clinician',
      header: 'Clinician',
      render: (visit: any) => (
        <div className="flex items-center gap-2">
          <User className="size-4 text-gray-400" />
          <span>{visit.caregiverName || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'visitType',
      header: 'Type',
      render: (visit: any) => (
        <span className="text-sm text-gray-600">{visit.visitType || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (visit: any) => (
        <Badge className={getStatusColor(visit.status)}>
          {visit.status?.replace(/_/g, ' ') || 'unknown'}
        </Badge>
      ),
    },
    {
      key: 'docStatus',
      header: 'Doc Status',
      render: (visit: any) => {
        const docStatus = visit.documentationStatus || (visit.status === 'completed' ? 'pending' : 'n/a');
        const docColors: Record<string, string> = {
          completed: 'bg-green-100 text-green-800',
          in_progress: 'bg-amber-100 text-amber-800',
          pending: 'bg-red-100 text-red-800',
          'n/a': 'bg-gray-100 text-gray-500',
        };
        return (
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-gray-400" />
            <Badge className={docColors[docStatus] || docColors['n/a']}>
              {docStatus === 'n/a' ? 'N/A' : docStatus.replace(/_/g, ' ')}
            </Badge>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Visits</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadVisits} disabled={loading}>
            <RefreshCw className={`size-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 text-blue-500 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading visits...</span>
            </div>
          ) : (
            <CompactTable
              columns={columns}
              data={visits}
              keyExtractor={(visit) => visit.id}
              emptyMessage="No visits found for this patient"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}