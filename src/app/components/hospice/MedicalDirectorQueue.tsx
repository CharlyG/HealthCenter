/**
 * Medical Director Queue Component
 * Lists documents awaiting Medical Director signature with review drawer.
 * Wired to backend: GET /hospice/md-queue, PUT /sign, POST /batch-sign
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  FileText,
  Clock,
  AlertTriangle,
  PenLine,
  Eye,
  UserCheck,
  Stethoscope,
  RefreshCw,
  X,
  CheckCircle2,
  Calendar,
  User,
  ChevronRight,
  ClipboardCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CompactTable, type CompactColumn } from '../design-system/CompactTable';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchMDQueue, signMDDocument, batchSignMDDocuments } from '../../lib/hospiceApi';
import { toast } from 'sonner';

type DocType = 'cti' | 'f2f' | 'poc' | 'recert' | 'verbal_order' | 'death_summary';
type Urgency = 'urgent' | 'routine' | 'overdue';

interface QueueDocument {
  id: string;
  patientName: string;
  mrn: string;
  docType: DocType;
  docTitle: string;
  submittedBy: string;
  submittedDate: string;
  urgency: Urgency;
  daysWaiting: number;
  certPeriod?: string;
  notes?: string;
  status?: string;
}

const docTypeLabels: Record<DocType, { label: string; color: string; description: string }> = {
  cti: { label: 'CTI', color: 'bg-purple-50 text-purple-700 border-purple-200', description: 'Clinical Terminal Illness narrative documenting terminal prognosis and hospice eligibility.' },
  f2f: { label: 'Face-to-Face', color: 'bg-blue-50 text-blue-700 border-blue-200', description: 'Face-to-Face encounter required for recertification of hospice benefit period.' },
  poc: { label: 'Plan of Care', color: 'bg-green-50 text-green-700 border-green-200', description: 'Interdisciplinary plan of care requiring physician review and signature.' },
  recert: { label: 'Recertification', color: 'bg-teal-50 text-teal-700 border-teal-200', description: 'Recertification of terminal illness for continued hospice benefit period.' },
  verbal_order: { label: 'Verbal Order', color: 'bg-orange-50 text-orange-700 border-orange-200', description: 'Verbal order requiring physician co-signature within regulatory timeframe.' },
  death_summary: { label: 'Death Summary', color: 'bg-gray-100 text-gray-700 border-gray-200', description: 'Final clinical summary documenting the patient\'s course and death.' },
};

const urgencyConfig: Record<Urgency, { label: string; icon: React.ReactNode; color: string }> = {
  urgent: { label: 'Urgent', icon: <AlertTriangle className="size-3 text-red-500" />, color: 'bg-red-50 text-red-700 border-red-200' },
  overdue: { label: 'Overdue', icon: <Clock className="size-3 text-amber-500" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  routine: { label: 'Routine', icon: <Clock className="size-3 text-gray-400" />, color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const formatDateLong = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

export const MedicalDirectorQueue = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [documents, setDocuments] = useState<QueueDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);

  // Review drawer
  const [reviewDoc, setReviewDoc] = useState<QueueDocument | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMDQueue({
        search: searchQuery || undefined,
        docType: docTypeFilter,
        urgency: urgencyFilter,
      });
      setDocuments(data.filter((d: QueueDocument) => d.status !== 'signed'));
    } catch (err: any) {
      console.error('[MedicalDirectorQueue] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, docTypeFilter, urgencyFilter]);

  useEffect(() => {
    const debounce = setTimeout(loadDocuments, 300);
    return () => clearTimeout(debounce);
  }, [loadDocuments]);

  const handleSign = useCallback(async (id: string) => {
    setSigningId(id);
    try {
      await signMDDocument(id);
      toast.success('Document signed successfully');
      setReviewDoc(null);
      await loadDocuments();
    } catch (err: any) {
      console.error('[MedicalDirectorQueue] Sign error:', err);
      toast.error('Failed to sign document');
    } finally {
      setSigningId(null);
    }
  }, [loadDocuments]);

  const handleBatchSign = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setSigning(true);
    try {
      await batchSignMDDocuments(Array.from(selectedIds));
      toast.success(`${selectedIds.size} documents signed`);
      setSelectedIds(new Set());
      await loadDocuments();
    } catch (err: any) {
      console.error('[MedicalDirectorQueue] Batch sign error:', err);
      toast.error('Failed to batch sign');
    } finally {
      setSigning(false);
    }
  }, [selectedIds, loadDocuments]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === documents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(documents.map((d) => d.id)));
    }
  }, [documents, selectedIds.size]);

  const metrics = useMemo(() => ({
    total: documents.length,
    urgent: documents.filter((d) => d.urgency === 'urgent').length,
    overdue: documents.filter((d) => d.urgency === 'overdue').length,
    avgWait: documents.length > 0
      ? Math.round(documents.reduce((s, d) => s + d.daysWaiting, 0) / documents.length)
      : 0,
  }), [documents]);

  const columns: CompactColumn<QueueDocument>[] = useMemo(() => [
    {
      key: 'select', header: '', width: '36px',
      render: (item) => (
        <input
          type="checkbox"
          className="size-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
          checked={selectedIds.has(item.id)}
          onChange={() => toggleSelect(item.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'urgency', header: '', width: '32px',
      render: (item) => (
        <span title={urgencyConfig[item.urgency]?.label}>
          {urgencyConfig[item.urgency]?.icon}
        </span>
      ),
    },
    {
      key: 'patient', header: 'Patient',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.patientName}</div>
          <div className="text-gray-500">{item.mrn}</div>
        </div>
      ),
    },
    {
      key: 'docType', header: 'Document',
      render: (item) => {
        const cfg = docTypeLabels[item.docType];
        return (
          <div>
            {cfg && <Badge className={`${cfg.color} text-[10px] mb-1`}>{cfg.label}</Badge>}
            <div className="text-xs text-gray-600">{item.docTitle}</div>
          </div>
        );
      },
    },
    {
      key: 'submittedBy', header: 'Submitted By',
      render: (item) => (
        <div>
          <div className="text-xs text-gray-700">{item.submittedBy}</div>
          <div className="text-xs text-gray-400">{formatDate(item.submittedDate)}</div>
        </div>
      ),
    },
    {
      key: 'waiting', header: 'Waiting', align: 'center' as const,
      render: (item) => {
        const color = item.daysWaiting >= 7 ? 'text-red-600 font-bold' : item.daysWaiting >= 4 ? 'text-amber-600 font-semibold' : 'text-gray-600';
        return <span className={`text-sm ${color}`}>{item.daysWaiting}d</span>;
      },
    },
    {
      key: 'actions', header: '', align: 'right' as const, width: '140px',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2"
            onClick={(e) => { e.stopPropagation(); setReviewDoc(item); }}
          >
            <Eye className="size-3 mr-1" />Review
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs px-2 bg-rose-600 hover:bg-rose-700"
            disabled={signingId === item.id}
            onClick={(e) => { e.stopPropagation(); handleSign(item.id); }}
          >
            {signingId === item.id ? <RefreshCw className="size-3 mr-1 animate-spin" /> : <PenLine className="size-3 mr-1" />}
            Sign
          </Button>
        </div>
      ),
    },
  ], [selectedIds, toggleSelect, signingId, handleSign]);

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Pending" value={metrics.total} icon={<FileText className="size-5" />} />
        <MetricCard title="Urgent" value={metrics.urgent} icon={<AlertTriangle className="size-5" />} variant="danger" />
        <MetricCard title="Overdue (>5 days)" value={metrics.overdue} icon={<Clock className="size-5" />} variant="warning" />
        <MetricCard title="Avg Wait Time" value={`${metrics.avgWait} days`} icon={<Stethoscope className="size-5" />} />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="size-5 text-rose-600" />
              Documents Awaiting Signature
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search..." className="pl-9 w-48 h-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
                <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Doc Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(docTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-32 h-9 text-sm"><SelectValue placeholder="Urgency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-9" onClick={loadDocuments}>
                <RefreshCw className="size-3" />
              </Button>
            </div>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
              <Button size="sm" className="bg-rose-600 hover:bg-rose-700 h-8 text-xs" disabled={signing} onClick={handleBatchSign}>
                {signing ? <RefreshCw className="size-3 mr-1 animate-spin" /> : <PenLine className="size-3 mr-1" />}
                Batch Sign ({selectedIds.size})
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setSelectedIds(new Set())}>Clear</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState message="Loading MD queue..." />
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p className="text-sm mb-2">{error}</p>
              <Button size="sm" variant="outline" onClick={loadDocuments}>Retry</Button>
            </div>
          ) : (
            <>
              <div className="mb-2">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" className="size-4 rounded border-gray-300" checked={selectedIds.size === documents.length && documents.length > 0} onChange={toggleAll} />
                  Select all
                </label>
              </div>
              <CompactTable
                data={documents}
                columns={columns}
                keyExtractor={(item) => item.id}
                onRowClick={(item) => setReviewDoc(item)}
                emptyMessage={searchQuery ? 'No matching documents' : 'No documents awaiting signature'}
                striped
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Document Review Drawer ─────────────────────────────────────── */}
      {reviewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setReviewDoc(null)}>
          <Card className="w-[640px] max-w-[90vw] max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="size-4 text-rose-600" />
                    Document Review
                  </CardTitle>
                  <CardDescription>{reviewDoc.docTitle}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setReviewDoc(null)}><X className="size-4" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Urgency Banner */}
              {reviewDoc.urgency !== 'routine' && (
                <div className={`flex items-center gap-2 p-2.5 rounded-md border ${
                  reviewDoc.urgency === 'urgent' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                }`}>
                  {urgencyConfig[reviewDoc.urgency].icon}
                  <span className={`text-xs font-semibold ${reviewDoc.urgency === 'urgent' ? 'text-red-700' : 'text-amber-700'}`}>
                    {reviewDoc.urgency === 'urgent' ? 'URGENT — Requires immediate attention' : `OVERDUE — Waiting ${reviewDoc.daysWaiting} days`}
                  </span>
                </div>
              )}

              {/* Patient & Document Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Patient</div>
                    <div className="font-medium text-gray-900">{reviewDoc.patientName}</div>
                    <div className="text-xs text-gray-500">{reviewDoc.mrn}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Cert Period</div>
                    <div className="font-medium">{reviewDoc.certPeriod || 'N/A'}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Document Type</div>
                    <Badge className={`${docTypeLabels[reviewDoc.docType]?.color} text-xs`}>
                      {docTypeLabels[reviewDoc.docType]?.label}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Submitted By</div>
                    <div className="font-medium">{reviewDoc.submittedBy}</div>
                    <div className="text-xs text-gray-400">{formatDateLong(reviewDoc.submittedDate)}</div>
                  </div>
                </div>
              </div>

              {/* Document Type Description */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <ClipboardCheck className="size-3" /> Document Description
                </h4>
                <p className="text-xs text-gray-600">{docTypeLabels[reviewDoc.docType]?.description}</p>
              </div>

              {/* Notes */}
              {reviewDoc.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <h4 className="text-xs font-semibold text-amber-700 mb-1">Submitter Notes</h4>
                  <p className="text-xs text-amber-800">{reviewDoc.notes}</p>
                </div>
              )}

              {/* Simulated Document Content */}
              <div className="border border-gray-200 rounded-md">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <FileText className="size-3" /> Document Preview
                  </h4>
                </div>
                <div className="p-4 text-xs text-gray-600 space-y-3 font-mono bg-white">
                  <div className="border-b border-gray-100 pb-2">
                    <div className="font-semibold text-gray-800 text-sm mb-1">{reviewDoc.docTitle}</div>
                    <div>Patient: {reviewDoc.patientName} ({reviewDoc.mrn})</div>
                    <div>Date: {formatDateLong(reviewDoc.submittedDate)}</div>
                    <div>Prepared by: {reviewDoc.submittedBy}</div>
                  </div>
                  {reviewDoc.docType === 'cti' && (
                    <div className="space-y-1.5">
                      <p>I certify that {reviewDoc.patientName} has a terminal illness with a life expectancy of six months or less if the disease runs its normal course.</p>
                      <p>Clinical indicators supporting this determination include progressive decline in functional status, weight loss, and disease-specific markers consistent with end-stage disease process.</p>
                      <p>The patient meets hospice eligibility criteria per CMS guidelines.</p>
                    </div>
                  )}
                  {reviewDoc.docType === 'f2f' && (
                    <div className="space-y-1.5">
                      <p>Face-to-Face encounter conducted to determine continued eligibility for hospice benefit.</p>
                      <p>Patient examination reveals continued decline consistent with terminal prognosis. Functional status has declined since last assessment period.</p>
                      <p>Based on this encounter, I recommend continued hospice care for the next benefit period.</p>
                    </div>
                  )}
                  {reviewDoc.docType === 'poc' && (
                    <div className="space-y-1.5">
                      <p>Interdisciplinary Plan of Care has been reviewed and updated for the current certification period.</p>
                      <p>Care goals, interventions, and frequency of services have been established by the IDG team and reviewed with the patient/family.</p>
                    </div>
                  )}
                  {reviewDoc.docType === 'recert' && (
                    <div className="space-y-1.5">
                      <p>Recertification of terminal illness for continued hospice benefit period.</p>
                      <p>Clinical evidence supports continued prognosis of six months or less. Patient continues to meet hospice eligibility criteria.</p>
                    </div>
                  )}
                  {reviewDoc.docType === 'verbal_order' && (
                    <div className="space-y-1.5">
                      <p>Verbal order received and documented per facility protocol.</p>
                      <p>Order details and clinical rationale are documented in the patient record.</p>
                      {reviewDoc.notes && <p className="font-semibold">Clinical note: {reviewDoc.notes}</p>}
                    </div>
                  )}
                  {reviewDoc.docType === 'death_summary' && (
                    <div className="space-y-1.5">
                      <p>Final summary of the patient's hospice course, including symptom management, interventions provided, and circumstances of death.</p>
                      <p>Bereavement services have been initiated for the family as per the plan of care.</p>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-2 mt-4">
                    <div className="text-gray-400">Signature: ____________________________</div>
                    <div className="text-gray-400 mt-1">Medical Director / Attending Physician</div>
                    <div className="text-gray-400">Date: ____________________________</div>
                  </div>
                </div>
              </div>

              {/* Waiting time */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="size-3" />
                <span>Waiting {reviewDoc.daysWaiting} day{reviewDoc.daysWaiting !== 1 ? 's' : ''} for signature</span>
                <Badge className={`${urgencyConfig[reviewDoc.urgency]?.color} text-[10px]`}>
                  {urgencyConfig[reviewDoc.urgency]?.label}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button size="sm" variant="outline" onClick={() => setReviewDoc(null)}>Close</Button>
                <Button
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-700"
                  disabled={signingId === reviewDoc.id}
                  onClick={() => handleSign(reviewDoc.id)}
                >
                  {signingId === reviewDoc.id ? (
                    <><RefreshCw className="size-3 mr-1 animate-spin" />Signing...</>
                  ) : (
                    <><PenLine className="size-3 mr-1" />Sign Document</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});

MedicalDirectorQueue.displayName = 'MedicalDirectorQueue';
