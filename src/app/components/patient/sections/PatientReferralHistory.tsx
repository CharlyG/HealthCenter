/**
 * PatientReferralHistory Section
 * Patient-level referral history across all admissions
 */
import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Calendar, Building2, User, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';
import { referralGateway } from '../../../lib/dataGateway';

interface PatientReferralHistoryProps {
  patientId: string;
}

interface Referral {
  id: string;
  referral_date: string;
  status: string;
  source: string;
  source_name?: string;
  referral_type?: string;
  priority?: string;
  created_at: string;
  notes?: string;
}

export default function PatientReferralHistory({ patientId }: PatientReferralHistoryProps) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferrals();
  }, [patientId]);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const result = await referralGateway.search({
        filters: { patientId },
        pagination: { page: 1, pageSize: 100 },
        sorting: { field: 'referral_date', direction: 'desc' },
      });
      setReferrals(result.data || []);
    } catch (err) {
      console.error('[PatientReferralHistory] Load error:', err);
      toast.error('Failed to load referral history');
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'qualified':
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'admitted':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'lost':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading referral history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="size-6 text-gray-600" />
            Referral History
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Patient-level referral history across all admissions
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {referrals.length} {referrals.length === 1 ? 'Referral' : 'Referrals'}
        </Badge>
      </div>

      {/* Referrals List */}
      {referrals.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="bg-gray-100 rounded-full p-4 inline-flex">
                <FileText className="size-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No referrals found</p>
                <p className="text-xs text-gray-600 mt-1">
                  This patient has no referral history
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {referrals.map((referral) => (
            <Card key={referral.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          Referral #{referral.id.slice(0, 8)}
                        </h4>
                        <Badge className={`${getStatusColor(referral.status)} text-xs`}>
                          {referral.status}
                        </Badge>
                        {referral.priority && (
                          <span className={`text-xs font-medium ${getPriorityColor(referral.priority)}`}>
                            {referral.priority} Priority
                          </span>
                        )}
                      </div>
                      {referral.referral_type && (
                        <p className="text-xs text-gray-600">
                          Type: {referral.referral_type}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink className="size-4" />
                    </Button>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="flex items-start gap-2">
                      <Calendar className="size-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600">Referral Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(referral.referral_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2 className="size-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600">Source</p>
                        <p className="font-medium text-gray-900">
                          {referral.source_name || referral.source}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="size-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-medium text-gray-900">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {referral.notes && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Notes:</span> {referral.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
