/**
 * CosignaturePanel — Co-signature workflow for clinical documentation.
 *
 * Features:
 * - Request co-signature from a supervisor (dialog with supervisor selection & note)
 * - Show pending co-sign status with timeline
 * - Supervisor can approve (cosign) or reject (return for revision)
 * - Shows cosign badge & history on completed documents
 */
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Shield,
  Loader2,
  PenLine,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { documentationGateway } from '../../lib/dataGateway';
import type { DocumentDraft } from '../../lib/documentationTypes';

// Mock supervisors list — would come from user/role system in production
const SUPERVISORS = [
  { id: 'sup-1', name: 'Dr. Robert Smith, MD', role: 'Supervising Physician' },
  { id: 'sup-2', name: 'Dr. Emily Chen, DO', role: 'Supervising Physician' },
  { id: 'sup-3', name: 'Lisa Anderson, RN, MSN', role: 'Clinical Supervisor' },
  { id: 'sup-4', name: 'Dr. James Wilson, MD', role: 'Medical Director' },
];

// ─── Request Cosign Dialog ──────────────────────────────────────────────────

interface RequestCosignDialogProps {
  draftId: string;
  onSuccess: (draft: DocumentDraft) => void;
  children: React.ReactNode;
}

const RequestCosignDialog = React.memo(function RequestCosignDialog({
  draftId,
  onSuccess,
  children,
}: RequestCosignDialogProps) {
  const [open, setOpen] = useState(false);
  const [supervisor, setSupervisor] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!supervisor) {
      toast.error('Please select a supervisor');
      return;
    }
    try {
      setSubmitting(true);
      const selected = SUPERVISORS.find((s) => s.id === supervisor);
      const res = await documentationGateway.requestCosign(draftId, {
        cosignRequestedTo: selected?.name || supervisor,
        cosignNote: note,
      });
      toast.success(`Co-signature requested from ${selected?.name}`);
      setOpen(false);
      setSupervisor('');
      setNote('');
      onSuccess(res.draft);
    } catch (err: any) {
      console.error('[CosignRequest] Error:', err);
      toast.error(`Failed to request co-signature: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [draftId, supervisor, note, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="size-5 text-blue-600" />
            Request Co-Signature
          </DialogTitle>
          <DialogDescription>
            Send this completed documentation to a supervisor for review and co-signature.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Supervising Clinician *</Label>
            <Select value={supervisor} onValueChange={setSupervisor}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select supervisor..." />
              </SelectTrigger>
              <SelectContent>
                {SUPERVISORS.map((sup) => (
                  <SelectItem key={sup.id} value={sup.id}>
                    <div className="flex flex-col">
                      <span className="text-sm">{sup.name}</span>
                      <span className="text-[10px] text-gray-500">{sup.role}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Note (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special notes for the reviewer..."
              className="min-h-[80px] text-sm"
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !supervisor}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            Send for Co-Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// ─── Cosign Action Dialog (for supervisors) ─────────────────────────────────

interface CosignActionDialogProps {
  draft: DocumentDraft;
  onSuccess: (draft: DocumentDraft) => void;
}

export const CosignActionDialog = React.memo(function CosignActionDialog({
  draft,
  onSuccess,
}: CosignActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = useCallback(async () => {
    try {
      setSubmitting(true);
      setAction('approve');
      const res = await documentationGateway.cosign(draft.id, {
        cosignedBy: 'Dr. Robert Smith, MD', // In production, from auth context
        cosignComment: comment,
      });
      toast.success('Documentation co-signed successfully');
      setOpen(false);
      onSuccess(res.draft);
    } catch (err: any) {
      console.error('[Cosign approve] Error:', err);
      toast.error(`Failed to co-sign: ${err.message}`);
    } finally {
      setSubmitting(false);
      setAction(null);
    }
  }, [draft.id, comment, onSuccess]);

  const handleReject = useCallback(async () => {
    if (!comment.trim()) {
      toast.error('Please provide a reason for returning the document');
      return;
    }
    try {
      setSubmitting(true);
      setAction('reject');
      const res = await documentationGateway.rejectCosign(draft.id, {
        cosignComment: comment,
      });
      toast.success('Documentation returned for revision');
      setOpen(false);
      onSuccess(res.draft);
    } catch (err: any) {
      console.error('[Cosign reject] Error:', err);
      toast.error(`Failed to reject: ${err.message}`);
    } finally {
      setSubmitting(false);
      setAction(null);
    }
  }, [draft.id, comment, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          <PenLine className="size-3.5" />
          Review & Co-Sign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-indigo-600" />
            Review & Co-Signature
          </DialogTitle>
          <DialogDescription>
            Review this documentation and approve or return for revision.
          </DialogDescription>
        </DialogHeader>

        {/* Request info */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Submitted by</span>
            <span className="text-xs font-medium">{draft.createdBy}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Requested to</span>
            <span className="text-xs font-medium">{draft.cosignRequestedTo}</span>
          </div>
          {draft.cosignRequestedAt && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Requested at</span>
              <span className="text-xs font-medium">
                {new Date(draft.cosignRequestedAt).toLocaleString()}
              </span>
            </div>
          )}
          {draft.cosignNote && (
            <div className="pt-1 border-t border-gray-200">
              <span className="text-[10px] text-gray-500">Note:</span>
              <p className="text-xs text-gray-700 mt-0.5">{draft.cosignNote}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Comment</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (required for rejection)..."
            className="min-h-[80px] text-sm"
            maxLength={1000}
          />
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={submitting}
            className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
          >
            {submitting && action === 'reject' ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RotateCcw className="size-3.5" />
            )}
            Return for Revision
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={submitting}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting && action === 'approve' ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            Approve & Co-Sign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

// ─── Cosign Status Badge ────────────────────────────────────────────────────

interface CosignStatusBadgeProps {
  draft: DocumentDraft;
}

export const CosignStatusBadge = React.memo(function CosignStatusBadge({
  draft,
}: CosignStatusBadgeProps) {
  if (draft.status === 'pending_cosign') {
    return (
      <Badge
        variant="outline"
        className="text-[9px] h-5 gap-1 bg-indigo-50 border-indigo-200 text-indigo-700"
      >
        <Clock className="size-2.5" />
        Pending Co-Sign
      </Badge>
    );
  }

  if (draft.status === 'cosigned') {
    return (
      <Badge
        variant="outline"
        className="text-[9px] h-5 gap-1 bg-emerald-50 border-emerald-200 text-emerald-700"
      >
        <Shield className="size-2.5" />
        Co-Signed
      </Badge>
    );
  }

  if (draft.cosignComment && draft.status === 'in_progress') {
    return (
      <Badge
        variant="outline"
        className="text-[9px] h-5 gap-1 bg-amber-50 border-amber-200 text-amber-700"
      >
        <AlertTriangle className="size-2.5" />
        Returned
      </Badge>
    );
  }

  return null;
});

// ─── Cosign Timeline ────────────────────────────────────────────────────────

interface CosignTimelineProps {
  draft: DocumentDraft;
}

export const CosignTimeline = React.memo(function CosignTimeline({
  draft,
}: CosignTimelineProps) {
  if (!draft.cosignRequestedAt && !draft.cosignedAt) return null;

  return (
    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 space-y-2">
      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        Co-Signature History
      </h4>

      <div className="space-y-2.5">
        {/* Requested */}
        {draft.cosignRequestedAt && (
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <Send className="size-2.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-800">
                Co-signature requested from {draft.cosignRequestedTo}
              </p>
              <p className="text-[9px] text-gray-400">
                {new Date(draft.cosignRequestedAt).toLocaleString()}
              </p>
              {draft.cosignNote && (
                <p className="text-[10px] text-gray-600 mt-0.5 italic">
                  &ldquo;{draft.cosignNote}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cosigned */}
        {draft.cosignedAt && (
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="size-2.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-800">
                Co-signed by {draft.cosignedBy}
              </p>
              <p className="text-[9px] text-gray-400">
                {new Date(draft.cosignedAt).toLocaleString()}
              </p>
              {draft.cosignComment && (
                <p className="text-[10px] text-gray-600 mt-0.5 italic">
                  &ldquo;{draft.cosignComment}&rdquo;
                </p>
              )}
            </div>
          </div>
        )}

        {/* Rejected / returned */}
        {draft.cosignComment && draft.status === 'in_progress' && (
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <XCircle className="size-2.5 text-red-600" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-800">
                Returned for revision
              </p>
              <p className="text-[10px] text-gray-600 mt-0.5 italic">
                &ldquo;{draft.cosignComment}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export { RequestCosignDialog };
export default CosignaturePanel;

// Convenience wrapper
function CosignaturePanel() {
  return null; // Composed from individual exports above
}
