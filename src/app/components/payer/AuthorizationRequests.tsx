/**
 * Authorization Requests
 * Submit and track prior authorization requests to payers
 */
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '../ui/utils';
import {
  FileCheck, Plus, Search, Filter, Send, Clock,
  CheckCircle2, XCircle, AlertCircle, MoreVertical,
  Calendar, User, Building2, Activity, Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { LoadingState } from '../design-system/LoadingState';
import { fetchAuthorizations, createAuthorization, updateAuthorizationStatus } from '../../lib/payerApi';
import { toast } from 'sonner';

type AuthStatus = 'pending' | 'submitted' | 'approved' | 'denied' | 'partial' | 'cancelled';

interface Authorization {
  id: string;
  authNumber?: string;
  patientName: string;
  patientId: string;
  mrn: string;
  payer: string;
  serviceType: string;
  requestedUnits: number;
  approvedUnits?: number;
  startDate: string;
  endDate: string;
  status: AuthStatus;
  requestedDate: string;
  responseDate?: string;
  requestedBy: string;
  diagnosis: string;
  clinicalJustification: string;
  urgency: 'routine' | 'urgent' | 'stat';
  notes?: string;
}

const STATUS_CONFIG: Record<AuthStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', bg: 'bg-gray-50', color: 'text-gray-700', icon: <Clock className="size-3" /> },
  submitted: { label: 'Submitted', bg: 'bg-blue-50', color: 'text-blue-700', icon: <Send className="size-3" /> },
  approved: { label: 'Approved', bg: 'bg-green-50', color: 'text-green-700', icon: <CheckCircle2 className="size-3" /> },
  denied: { label: 'Denied', bg: 'bg-red-50', color: 'text-red-700', icon: <XCircle className="size-3" /> },
  partial: { label: 'Partial Approval', bg: 'bg-amber-50', color: 'text-amber-700', icon: <AlertCircle className="size-3" /> },
  cancelled: { label: 'Cancelled', bg: 'bg-gray-50', color: 'text-gray-600', icon: <XCircle className="size-3" /> },
};

const URGENCY_CONFIG = {
  routine: { label: 'Routine', color: 'text-gray-600' },
  urgent: { label: 'Urgent', color: 'text-amber-600' },
  stat: { label: 'STAT', color: 'text-red-600' },
};

// ─── Create Authorization Modal ────────────────────────────────────────────

const CreateAuthorizationForm = React.memo(function CreateAuthorizationForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Authorization>>({
    urgency: 'routine',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createAuthorization(formData as Authorization);
      toast.success('Authorization request created successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[CreateAuthorizationForm] Error:', err);
      toast.error(err.message || 'Failed to create authorization');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle>Create Authorization Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  required
                  value={formData.patientName || ''}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="mrn">MRN *</Label>
                <Input
                  id="mrn"
                  required
                  value={formData.mrn || ''}
                  onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="payer">Payer *</Label>
              <Select
                value={formData.payer}
                onValueChange={(value) => setFormData({ ...formData, payer: value })}
              >
                <SelectTrigger id="payer">
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicare">Medicare</SelectItem>
                  <SelectItem value="Medicaid">Medicaid</SelectItem>
                  <SelectItem value="Blue Cross Blue Shield">Blue Cross Blue Shield</SelectItem>
                  <SelectItem value="UnitedHealthcare">UnitedHealthcare</SelectItem>
                  <SelectItem value="Aetna">Aetna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
              >
                <SelectTrigger id="serviceType">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home Health">Home Health</SelectItem>
                  <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                  <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                  <SelectItem value="Occupational Therapy">Occupational Therapy</SelectItem>
                  <SelectItem value="Speech Therapy">Speech Therapy</SelectItem>
                  <SelectItem value="Medical Social Work">Medical Social Work</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="requestedUnits">Requested Visits *</Label>
                <Input
                  id="requestedUnits"
                  type="number"
                  required
                  min="1"
                  value={formData.requestedUnits || ''}
                  onChange={(e) => setFormData({ ...formData, requestedUnits: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  required
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Input
                id="diagnosis"
                required
                placeholder="Primary diagnosis with ICD-10 code"
                value={formData.diagnosis || ''}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="clinicalJustification">Clinical Justification *</Label>
              <Textarea
                id="clinicalJustification"
                required
                rows={4}
                placeholder="Provide clinical justification for requested services..."
                value={formData.clinicalJustification || ''}
                onChange={(e) => setFormData({ ...formData, clinicalJustification: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="urgency">Urgency *</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value: any) => setFormData({ ...formData, urgency: value })}
              >
                <SelectTrigger id="urgency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="stat">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Creating...' : 'Create Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

// ─── Authorization Card ────────────────────────────────────────────────────

const AuthorizationCard = React.memo(function AuthorizationCard({
  auth,
  onUpdate,
}: {
  auth: Authorization;
  onUpdate: () => void;
}) {
  const statusConfig = STATUS_CONFIG[auth.status];
  const urgencyConfig = URGENCY_CONFIG[auth.urgency];
  const daysSinceRequest = Math.floor((Date.now() - new Date(auth.requestedDate).getTime()) / 86400000);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{auth.patientName}</h3>
                <Badge variant="outline" className="text-xs">
                  {auth.mrn}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{auth.serviceType}</p>
            </div>
            <Badge className={cn('text-xs', statusConfig.bg, statusConfig.color)}>
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </Badge>
          </div>

          {/* Auth Number */}
          {auth.authNumber && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-mono">Auth #: {auth.authNumber}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 text-xs">Payer</p>
              <p className="font-medium text-gray-900">{auth.payer}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Requested By</p>
              <p className="font-medium text-gray-900">{auth.requestedBy}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Requested Visits</p>
              <p className="font-medium text-gray-900">
                {auth.requestedUnits}
                {auth.approvedUnits && ` (${auth.approvedUnits} approved)`}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Service Period</p>
              <p className="font-medium text-gray-900">
                {new Date(auth.startDate).toLocaleDateString()} - {new Date(auth.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Diagnosis</p>
            <p className="text-sm font-medium text-gray-900">{auth.diagnosis}</p>
          </div>

          {/* Urgency & Timeline */}
          <div className="flex items-center justify-between text-xs">
            <span className={cn('font-semibold', urgencyConfig.color)}>
              {urgencyConfig.label}
            </span>
            <span className="text-gray-600">
              Requested {daysSinceRequest} day{daysSinceRequest !== 1 ? 's' : ''} ago
            </span>
          </div>

          {/* Actions */}
          {auth.status === 'pending' && (
            <div className="flex gap-2 pt-2 border-t">
              <Button size="sm" variant="outline" className="flex-1">
                <Send className="size-3 mr-1" />
                Submit
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Main Component ────────────────────────────────────────────────────────

export const AuthorizationRequests = React.memo(function AuthorizationRequests() {
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuthStatus | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadAuthorizations();
  }, []);

  const loadAuthorizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAuthorizations();
      setAuthorizations(data);
    } catch (err: any) {
      console.error('[AuthorizationRequests] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = authorizations;
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.mrn.toLowerCase().includes(q) ||
          a.authNumber?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [authorizations, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: authorizations.length,
      pending: authorizations.filter((a) => a.status === 'pending').length,
      approved: authorizations.filter((a) => a.status === 'approved').length,
      denied: authorizations.filter((a) => a.status === 'denied').length,
    };
  }, [authorizations]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading authorizations..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Authorization Requests</h2>
          <p className="text-sm text-gray-600 mt-1">
            Submit and track prior authorization requests
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="size-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <FileCheck className="size-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pending}</p>
              </div>
              <Clock className="size-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
              </div>
              <CheckCircle2 className="size-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Denied</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.denied}</p>
              </div>
              <XCircle className="size-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by patient, MRN, or auth number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileCheck className="size-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No authorizations found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((auth) => (
            <AuthorizationCard key={auth.id} auth={auth} onUpdate={loadAuthorizations} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateForm && (
        <CreateAuthorizationForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={loadAuthorizations}
        />
      )}
    </div>
  );
});
