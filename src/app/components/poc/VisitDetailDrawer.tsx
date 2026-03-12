/**
 * VisitDetailDrawer — Side drawer showing full visit information.
 * Includes patient info, caregiver, EVV timeline, documentation status,
 * conflict alerts, and quick actions.
 */
import React, { useMemo } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  X, Pencil, UserRoundCog, Send, Clock, MapPin, FileText,
  AlertTriangle, CheckCircle, User, CalendarDays, Stethoscope,
  ClipboardCheck, ShieldAlert, Layers, CalendarOff, Phone,
  ArrowRight, ExternalLink,
} from 'lucide-react';
import type { MonitorVisit, ConflictType } from './MonitorTypes';
import { VISIT_STATUS_CONFIG, EVV_STATUS_CONFIG, DOC_STATUS_CONFIG, CONFLICT_CONFIG } from './MonitorTypes';

// ─── Conflict Icon ──────────────────────────────────────────────────────────

function ConflictIcon({ type }: { type: ConflictType }) {
  switch (type) {
    case 'missing_clock_out': return <Clock className="size-4 text-red-500" />;
    case 'overlapping_visits': return <Layers className="size-4 text-orange-500" />;
    case 'unscheduled_visit': return <CalendarOff className="size-4 text-amber-500" />;
    case 'authorization_conflict': return <ShieldAlert className="size-4 text-purple-500" />;
  }
}

// ─── Section ────────────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-4 text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Info Row ───────────────────────────────────────────────────────────────

function InfoRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between py-1.5', className)}>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-800">{value}</span>
    </div>
  );
}

// ─── EVV Timeline ───────────────────────────────────────────────────────────

function EvvTimeline({ visit }: { visit: MonitorVisit }) {
  const steps = useMemo(() => {
    const s: { label: string; time: string; status: 'done' | 'active' | 'pending' | 'error' }[] = [];

    // Scheduled
    s.push({ label: 'Scheduled', time: visit.scheduledTime, status: 'done' });

    // Clock In
    if (visit.actualStartTime) {
      s.push({ label: 'Clock In', time: visit.actualStartTime, status: 'done' });
    } else if (visit.status === 'in_progress' || visit.status === 'missing_clock_out') {
      s.push({ label: 'Clock In', time: '—', status: 'active' });
    } else {
      s.push({ label: 'Clock In', time: '—', status: 'pending' });
    }

    // Clock Out
    if (visit.actualEndTime) {
      s.push({ label: 'Clock Out', time: visit.actualEndTime, status: 'done' });
    } else if (visit.status === 'missing_clock_out') {
      s.push({ label: 'Clock Out', time: 'MISSING', status: 'error' });
    } else if (visit.status === 'in_progress') {
      s.push({ label: 'Clock Out', time: '—', status: 'active' });
    } else {
      s.push({ label: 'Clock Out', time: '—', status: 'pending' });
    }

    // EVV Transmit
    if (visit.evvStatus === 'transmitted' || visit.evvStatus === 'verified') {
      s.push({ label: 'EVV Transmitted', time: 'Sent', status: 'done' });
    } else if (visit.evvStatus === 'evv_error' || visit.evvStatus === 'exception') {
      s.push({ label: 'EVV Transmitted', time: 'ERROR', status: 'error' });
    } else {
      s.push({ label: 'EVV Transmitted', time: '—', status: 'pending' });
    }

    return s;
  }, [visit]);

  return (
    <div className="space-y-0">
      {steps.map((step, idx) => (
        <div key={step.label} className="flex items-start gap-3">
          {/* Line + dot */}
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-3 h-3 rounded-full border-2 mt-0.5 shrink-0',
              step.status === 'done' && 'bg-emerald-500 border-emerald-500',
              step.status === 'active' && 'bg-blue-500 border-blue-500 animate-pulse',
              step.status === 'pending' && 'bg-white border-gray-300',
              step.status === 'error' && 'bg-red-500 border-red-500',
            )} />
            {idx < steps.length - 1 && (
              <div className={cn(
                'w-0.5 h-6',
                step.status === 'done' ? 'bg-emerald-300' : 'bg-gray-200',
              )} />
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{step.label}</span>
              <span className={cn(
                'text-xs font-mono tabular-nums',
                step.status === 'error' ? 'text-red-600 font-bold' :
                step.status === 'done' ? 'text-gray-700' : 'text-gray-400',
              )}>
                {step.time}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Drawer ────────────────────────────────────────────────────────────

interface VisitDetailDrawerProps {
  visit: MonitorVisit | null;
  open: boolean;
  onClose: () => void;
  onEdit: (visit: MonitorVisit) => void;
  onReassign: (visit: MonitorVisit) => void;
  onTransmit: (visit: MonitorVisit) => void;
}

export default function VisitDetailDrawer({ visit, open, onClose, onEdit, onReassign, onTransmit }: VisitDetailDrawerProps) {
  if (!visit || !open) return null;

  const statusCfg = VISIT_STATUS_CONFIG[visit.status];
  const evvCfg = EVV_STATUS_CONFIG[visit.evvStatus];
  const docCfg = DOC_STATUS_CONFIG[visit.docStatus];
  const hasConflicts = visit.conflicts.length > 0;

  const duration = useMemo(() => {
    if (!visit.actualStartTime || !visit.actualEndTime) return null;
    const [sh, sm] = visit.actualStartTime.split(':').map(Number);
    const [eh, em] = visit.actualEndTime.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [visit]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700">
                  {visit.patientName.split(', ').map(w => w[0]).join('')}
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{visit.patientName}</h2>
                <p className="text-xs text-gray-400">{visit.patientMrn} &middot; {visit.admissionLabel}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border', statusCfg.bg, statusCfg.border, statusCfg.color)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot)} />
              {statusCfg.label}
            </span>
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border', evvCfg.bg, evvCfg.border, evvCfg.color)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', evvCfg.dot)} />
              EVV: {evvCfg.label}
            </span>
            <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium', docCfg.bg, docCfg.color)}>
              Doc: {docCfg.label}
            </span>
          </div>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1">
          {/* Conflict alerts */}
          {hasConflicts && (
            <div className="px-5 py-3 bg-red-50/50 border-b border-red-100">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="size-4 text-red-500" />
                <span className="text-xs font-bold text-red-700">Active Conflicts</span>
              </div>
              <div className="space-y-1.5">
                {visit.conflicts.map(c => {
                  const cfg = CONFLICT_CONFIG[c];
                  return (
                    <div key={c} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border', cfg.bg, cfg.border)}>
                      <ConflictIcon type={c} />
                      <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Visit Info */}
          <Section title="Visit Information" icon={CalendarDays}>
            <InfoRow label="Visit Type" value={<Badge variant="outline" className="text-[10px] h-5 px-1.5">{visit.visitType}</Badge>} />
            <InfoRow label="Discipline" value={visit.discipline} />
            <InfoRow label="Scheduled Date" value={visit.scheduledDate} />
            <InfoRow label="Scheduled Time" value={visit.scheduledTime} />
            {visit.actualStartTime && <InfoRow label="Actual Start" value={visit.actualStartTime} />}
            {visit.actualEndTime && <InfoRow label="Actual End" value={visit.actualEndTime} />}
            {duration && <InfoRow label="Duration" value={duration} />}
            {visit.authorizationRemaining !== undefined && (
              <InfoRow
                label="Auth Remaining"
                value={
                  <span className={cn(visit.authorizationRemaining === 0 ? 'text-red-600 font-bold' : '')}>
                    {visit.authorizationRemaining} visits
                  </span>
                }
              />
            )}
          </Section>

          {/* Caregiver */}
          <Section title="Caregiver" icon={User}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <User className="size-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{visit.caregiverName}</p>
                <p className="text-xs text-gray-400">ID: {visit.caregiverId}</p>
              </div>
            </div>
          </Section>

          {/* EVV Timeline */}
          <Section title="EVV Timeline" icon={Clock}>
            <EvvTimeline visit={visit} />
          </Section>

          {/* Documentation */}
          <Section title="Documentation" icon={FileText}>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <ClipboardCheck className={cn('size-5', docCfg.color)} />
              <div>
                <p className="text-sm font-medium text-gray-700">{docCfg.label}</p>
                <p className="text-[10px] text-gray-400">
                  {visit.docStatus === 'completed' ? 'All documentation finalized' :
                   visit.docStatus === 'in_progress' ? 'Documentation in progress' :
                   visit.docStatus === 'pending' ? 'Documentation not started' :
                   'No documentation required'}
                </p>
              </div>
            </div>
          </Section>

          {/* Notes */}
          {visit.notes && (
            <Section title="Notes" icon={FileText}>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{visit.notes}</p>
            </Section>
          )}
        </ScrollArea>

        {/* Actions footer */}
        <div className="shrink-0 px-5 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs flex-1"
            onClick={() => { onClose(); onEdit(visit); }}
          >
            <Pencil className="size-3.5" />
            Edit Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs flex-1"
            onClick={() => { onClose(); onReassign(visit); }}
          >
            <UserRoundCog className="size-3.5" />
            Reassign
          </Button>
          {(visit.status === 'completed' && (visit.evvStatus === 'pending' || visit.evvStatus === 'evv_error')) && (
            <Button
              size="sm"
              className="gap-1.5 text-xs flex-1"
              onClick={() => { onClose(); onTransmit(visit); }}
            >
              <Send className="size-3.5" />
              Transmit EVV
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
