/**
 * CosignQueue — Bulk co-signature queue for supervisors.
 *
 * Features:
 * - Lists all pending co-signature documents across all patients
 * - Urgency indicators (routine / urgent / stat) based on wait time
 * - Bulk select with checkboxes for batch approval
 * - Individual review & co-sign actions
 * - Audit trail access per document
 * - Filters by clinician, urgency, and template type
 * - Responsive table with memoized rows
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  Shield,
  Loader2,
  Search,
  Filter,
  AlertTriangle,
  Zap,
  FileText,
  RefreshCw,
  History,
  Inbox,
} from 'lucide-react';
import { documentationGateway } from '../lib/dataGateway';
import type { CosignQueueItem, DocumentDraft } from '../lib/documentationTypes';
import { CosignActionDialog } from '../components/documentation/CosignaturePanel';
import { AuditTrailPanel } from '../components/documentation/AuditTrailPanel';

// ─── Urgency Config ─────────────────────────────────────────────────────────

const URGENCY_CONFIG = {
  routine: {
    label: 'Routine',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Clock,
  },
  urgent: {
    label: 'Urgent',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertTriangle,
  },
  stat: {
    label: 'STAT',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: Zap,
  },
};

// ─── Queue Row ──────────────────────────────────────────────────────────────

interface QueueRowProps {
  item: CosignQueueItem;
  isSelected: boolean;
  onToggleSelect: (draftId: string) => void;
  onDraftUpdate: (draft: DocumentDraft) => void;
}

const QueueRow = React.memo(function QueueRow({
  item,
  isSelected,
  onToggleSelect,
  onDraftUpdate,
}: QueueRowProps) {
  const { draft, urgency = 'routine' } = item;
  const config = URGENCY_CONFIG[urgency];
  const UrgencyIcon = config.icon;
  const requestedAt = draft.cosignRequestedAt ? new Date(draft.cosignRequestedAt) : new Date(draft.updatedAt);
  const hoursWaiting = Math.round((Date.now() - requestedAt.getTime()) / (1000 * 60 * 60));

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 border-b border-gray-100 transition-colors hover:bg-gray-50',
        isSelected && 'bg-indigo-50/50'
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(draft.id)}
        className="shrink-0"
      />

      {/* Urgency badge */}
      <Badge
        variant="outline"
        className={cn(
          'text-[8px] h-5 px-1.5 gap-1 shrink-0 w-16 justify-center',
          config.bgColor,
          config.borderColor,
          config.color
        )}
      >
        <UrgencyIcon className="size-2.5" />
        {config.label}
      </Badge>

      {/* Document info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-gray-400 shrink-0" />
          <span className="text-sm font-medium text-gray-900 truncate">
            {draft.templateName}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] text-gray-500">
            Patient: {draft.patientId}
          </span>
          <span className="text-[10px] text-gray-400">|</span>
          <span className="text-[10px] text-gray-500">
            By: {draft.createdBy}
          </span>
        </div>
      </div>

      {/* Requested to */}
      <div className="w-40 shrink-0 hidden lg:block">
        <p className="text-[10px] text-gray-500">Requested to</p>
        <p className="text-xs font-medium text-gray-700 truncate">
          {draft.cosignRequestedTo || '—'}
        </p>
      </div>

      {/* Wait time */}
      <div className="w-24 shrink-0 text-right">
        <p className="text-[10px] text-gray-500">Waiting</p>
        <p className={cn(
          'text-xs font-semibold',
          hoursWaiting > 48 ? 'text-red-600' :
          hoursWaiting > 24 ? 'text-amber-600' :
          'text-gray-700'
        )}>
          {hoursWaiting < 1 ? '< 1h' :
           hoursWaiting < 24 ? `${hoursWaiting}h` :
           `${Math.floor(hoursWaiting / 24)}d ${hoursWaiting % 24}h`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <AuditTrailPanel draftId={draft.id}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
            title="View audit trail"
          >
            <History className="size-3.5" />
          </Button>
        </AuditTrailPanel>

        <CosignActionDialog draft={draft} onSuccess={onDraftUpdate} />
      </div>
    </div>
  );
});

// ─── Bulk Cosign Dialog ─────────────────────────────────────────────────────

interface BulkCosignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (comment: string) => void;
  loading: boolean;
}

const BulkCosignDialog = React.memo(function BulkCosignDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  loading,
}: BulkCosignDialogProps) {
  const [comment, setComment] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-emerald-600" />
            Bulk Co-Signature
          </DialogTitle>
          <DialogDescription>
            You are about to co-sign {selectedCount} document{selectedCount !== 1 ? 's' : ''} at once.
            This action is logged for compliance purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Important Notice</p>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  By co-signing these documents, you certify that you have reviewed the clinical
                  documentation and approve it under your supervising authority. Each co-signature
                  will be individually recorded in the audit trail.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Comment (optional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment to all co-signed documents..."
              className="min-h-[80px] text-sm"
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onConfirm(comment)}
            disabled={loading}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            Co-Sign {selectedCount} Document{selectedCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// ─── Main CosignQueue Page ──────────────────────────────────────────────────

export default function CosignQueue() {
  const [items, setItems] = useState<CosignQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // ─── Load Queue ──────────────────────────────────────────────────
  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await documentationGateway.getCosignQueue();
      setItems(res.items || []);
    } catch (err: any) {
      console.error('[CosignQueue] Load error:', err);
      toast.error(`Failed to load co-sign queue: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  // ─── Filtering ────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let result = items;

    if (urgencyFilter !== 'all') {
      result = result.filter((item) => item.urgency === urgencyFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        item.draft.templateName.toLowerCase().includes(q) ||
        item.draft.createdBy.toLowerCase().includes(q) ||
        item.draft.patientId.toLowerCase().includes(q) ||
        (item.draft.cosignRequestedTo || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [items, urgencyFilter, search]);

  // ─── Selection ────────────────────────────────────────────────────
  const toggleSelect = useCallback((draftId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(draftId)) {
        next.delete(draftId);
      } else {
        next.add(draftId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((item) => item.draft.id)));
    }
  }, [filteredItems, selectedIds.size]);

  const allSelected = filteredItems.length > 0 && selectedIds.size === filteredItems.length;

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleDraftUpdate = useCallback((updatedDraft: DocumentDraft) => {
    // Remove from queue since it's no longer pending
    setItems((prev) => prev.filter((item) => item.draft.id !== updatedDraft.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(updatedDraft.id);
      return next;
    });
  }, []);

  const handleBulkCosign = useCallback(async (comment: string) => {
    if (selectedIds.size === 0) return;

    try {
      setBulkLoading(true);
      const res = await documentationGateway.bulkCosign({
        draftIds: Array.from(selectedIds),
        cosignedBy: 'Dr. Robert Smith, MD', // In production, from auth context
        cosignComment: comment || 'Bulk co-signature approved',
      });

      if (res.successCount > 0) {
        toast.success(`${res.successCount} document${res.successCount !== 1 ? 's' : ''} co-signed successfully`);
      }
      if (res.errorCount > 0) {
        toast.error(`${res.errorCount} document${res.errorCount !== 1 ? 's' : ''} failed to co-sign`);
      }

      setBulkDialogOpen(false);
      setSelectedIds(new Set());
      loadQueue(); // Refresh
    } catch (err: any) {
      console.error('[CosignQueue] Bulk cosign error:', err);
      toast.error(`Bulk co-sign failed: ${err.message}`);
    } finally {
      setBulkLoading(false);
    }
  }, [selectedIds, loadQueue]);

  // ─── Stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const routine = items.filter((i) => i.urgency === 'routine').length;
    const urgent = items.filter((i) => i.urgency === 'urgent').length;
    const stat = items.filter((i) => i.urgency === 'stat').length;
    return { total: items.length, routine, urgent, stat };
  }, [items]);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
              <UserCheck className="size-6 text-indigo-600" />
              Co-Signature Queue
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Review and co-sign pending clinical documentation
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadQueue}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Inbox className="size-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              <p className="text-[10px] text-gray-500">Pending</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          {stats.stat > 0 && (
            <Badge variant="outline" className="text-[10px] h-6 px-2 gap-1 bg-red-50 border-red-200 text-red-700">
              <Zap className="size-3" />
              {stats.stat} STAT
            </Badge>
          )}
          {stats.urgent > 0 && (
            <Badge variant="outline" className="text-[10px] h-6 px-2 gap-1 bg-amber-50 border-amber-200 text-amber-700">
              <AlertTriangle className="size-3" />
              {stats.urgent} Urgent
            </Badge>
          )}
          {stats.routine > 0 && (
            <Badge variant="outline" className="text-[10px] h-6 px-2 gap-1 bg-blue-50 border-blue-200 text-blue-700">
              <Clock className="size-3" />
              {stats.routine} Routine
            </Badge>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-2.5 flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, clinician, template..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Urgency filter */}
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <Filter className="size-3 mr-1 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgencies</SelectItem>
            <SelectItem value="stat">STAT Only</SelectItem>
            <SelectItem value="urgent">Urgent Only</SelectItem>
            <SelectItem value="routine">Routine Only</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {selectedIds.size} selected
            </span>
            <Button
              size="sm"
              onClick={() => setBulkDialogOpen(true)}
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="size-3.5" />
              Bulk Co-Sign
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="h-8 text-xs text-gray-500"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Queue list */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading queue...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <CheckCircle2 className="size-16 mx-auto mb-4 text-emerald-300" />
              <p className="text-lg font-semibold text-gray-900 mb-1">Queue is Clear</p>
              <p className="text-sm text-gray-500">
                {items.length === 0
                  ? 'No documents are awaiting co-signature'
                  : 'No documents match your current filters'}
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            {/* Header row */}
            <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 flex items-center gap-4 px-4 py-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                className="shrink-0"
              />
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-16 shrink-0">
                Urgency
              </span>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex-1">
                Document
              </span>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-40 shrink-0 hidden lg:block">
                Assigned To
              </span>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-24 shrink-0 text-right">
                Wait Time
              </span>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-32 shrink-0 text-right">
                Actions
              </span>
            </div>

            {/* Rows */}
            <div className="bg-white">
              {filteredItems.map((item) => (
                <QueueRow
                  key={item.draft.id}
                  item={item}
                  isSelected={selectedIds.has(item.draft.id)}
                  onToggleSelect={toggleSelect}
                  onDraftUpdate={handleDraftUpdate}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Bulk cosign dialog */}
      <BulkCosignDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkCosign}
        loading={bulkLoading}
      />
    </div>
  );
}