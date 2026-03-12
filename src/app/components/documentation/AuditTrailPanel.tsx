/**
 * AuditTrailPanel — Displays the compliance audit trail for a document.
 * Shows timestamped log of all actions: creation, saves, submissions,
 * co-signature requests, approvals, rejections, and PDF exports.
 *
 * Designed for HIPAA compliance tracking.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  History,
  FileText,
  Save,
  Send,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileDown,
  RefreshCw,
  Loader2,
  Shield,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { documentationGateway } from '../../lib/dataGateway';
import type { AuditLogEntry, AuditAction } from '../../lib/documentationTypes';

// ─── Action Config ──────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<AuditAction, {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
}> = {
  draft_created: {
    icon: FileText,
    label: 'Draft Created',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  draft_saved: {
    icon: Save,
    label: 'Draft Saved',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  },
  draft_submitted: {
    icon: Send,
    label: 'Submitted',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  cosign_requested: {
    icon: UserCheck,
    label: 'Co-Sign Requested',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  cosign_approved: {
    icon: CheckCircle2,
    label: 'Co-Signed',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  cosign_rejected: {
    icon: XCircle,
    label: 'Returned for Revision',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  draft_reopened: {
    icon: RefreshCw,
    label: 'Reopened',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  pdf_exported: {
    icon: FileDown,
    label: 'PDF Exported',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
};

// ─── Single Audit Entry ─────────────────────────────────────────────────────

const AuditEntry = React.memo(function AuditEntry({
  entry,
  isLast,
}: {
  entry: AuditLogEntry;
  isLast: boolean;
}) {
  const config = ACTION_CONFIG[entry.action] || {
    icon: History,
    label: entry.action,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
  };
  const Icon = config.icon;
  const ts = new Date(entry.timestamp);

  return (
    <div className="flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
          config.bgColor
        )}>
          <Icon className={cn('size-3.5', config.color)} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-gray-200 my-1" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-900">
              {config.label}
            </span>
            {entry.metadata?.bulkOperation && (
              <Badge variant="outline" className="text-[7px] h-3.5 px-1 bg-purple-50 border-purple-200 text-purple-600">
                Bulk
              </Badge>
            )}
          </div>
          <span className="text-[9px] text-gray-400 shrink-0">
            {ts.toLocaleDateString()} {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <p className="text-[11px] text-gray-600 mt-0.5">{entry.details}</p>

        <div className="flex items-center gap-3 mt-1">
          <span className="text-[9px] text-gray-400">
            <span className="font-medium text-gray-500">{entry.actor}</span>
            {entry.actorRole && (
              <span className="ml-1">({entry.actorRole})</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
});

// ─── Main Dialog ────────────────────────────────────────────────────────────

interface AuditTrailPanelProps {
  draftId: string;
  children?: React.ReactNode;
}

export const AuditTrailPanel = React.memo(function AuditTrailPanel({
  draftId,
  children,
}: AuditTrailPanelProps) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAuditTrail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await documentationGateway.getAuditTrail(draftId);
      setEntries(res.entries || []);
    } catch (err: any) {
      console.error('[AuditTrail] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [draftId]);

  useEffect(() => {
    if (open) {
      loadAuditTrail();
    }
  }, [open, loadAuditTrail]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 gap-1 text-gray-500 hover:text-gray-700"
          >
            <History className="size-3" />
            <span className="text-[10px]">Audit Trail</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5 text-indigo-600" />
            Compliance Audit Trail
          </DialogTitle>
        </DialogHeader>

        {/* Summary badges */}
        <div className="shrink-0 flex items-center gap-2 flex-wrap py-1">
          <Badge variant="outline" className="text-[9px] h-5 px-1.5 gap-1">
            <History className="size-2.5" />
            {entries.length} events
          </Badge>
          {entries.some((e) => e.action === 'cosign_approved') && (
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 gap-1 bg-emerald-50 border-emerald-200 text-emerald-700">
              <CheckCircle2 className="size-2.5" />
              Co-Signed
            </Badge>
          )}
          {entries.some((e) => e.action === 'pdf_exported') && (
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 gap-1 bg-blue-50 border-blue-200 text-blue-700">
              <FileDown className="size-2.5" />
              Exported
            </Badge>
          )}
          {entries.some((e) => e.action === 'cosign_rejected') && (
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 gap-1 bg-red-50 border-red-200 text-red-700">
              <AlertTriangle className="size-2.5" />
              Returned
            </Badge>
          )}
        </div>

        {/* Timeline */}
        <ScrollArea className="flex-1">
          <div className="pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-gray-400" />
                <span className="ml-2 text-xs text-gray-500">Loading audit trail...</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="size-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs text-gray-500">No audit events recorded yet</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Events are logged automatically when co-signature actions occur
                </p>
              </div>
            ) : (
              <div className="py-2">
                {entries.map((entry, idx) => (
                  <AuditEntry
                    key={entry.id}
                    entry={entry}
                    isLast={idx === entries.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* HIPAA footer */}
        <div className="shrink-0 pt-2 border-t border-gray-100">
          <p className="text-[9px] text-gray-400 text-center">
            HIPAA Compliance Log — All actions are immutably recorded for regulatory audit purposes
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default AuditTrailPanel;
