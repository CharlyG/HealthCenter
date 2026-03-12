/**
 * Patient Payer Snapshot - Right Drawer Component
 * Shows insurance / payer info pulled from the patient's most recent active admission
 */
import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { admissionGateway } from '../../../lib/dataGateway';

interface PatientPayerSnapshotProps {
  patientId: string;
}

export default function PatientPayerSnapshot({ patientId }: PatientPayerSnapshotProps) {
  const [payer, setPayer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await admissionGateway.search({
        filters: { patientId },
        pagination: { page: 1, pageSize: 10 },
      });
      // Find the most recent active admission
      const active = res.data.find((a) => a.status === 'active') || res.data[0];
      if (active) {
        setPayer({
          name: active.primaryPayerId || 'Unknown',
          type: 'Primary',
          effectiveDate: active.admissionDate || '',
          diagnosis: active.primaryDiagnosis || '',
          status: active.status,
        });
      }
    } catch (err) {
      console.error('[PatientPayerSnapshot] error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="size-5 text-blue-500 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!payer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="size-4" />
            Payer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-400 text-center py-2">No admission / payer data found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <CreditCard className="size-4" />
          Payer Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{payer.name}</p>
            <Badge variant="outline" className="text-xs">{payer.type}</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Effective:</span>
              <span className="font-medium text-gray-900">{payer.effectiveDate || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Diagnosis:</span>
              <span className="font-medium text-gray-900 truncate max-w-[60%] text-right">{payer.diagnosis || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5">{payer.status}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}