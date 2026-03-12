/**
 * CaregiverFieldApp — Mobile-optimized companion view for field caregivers.
 * Simulates the phone experience caregivers use to:
 * 1. View their daily schedule
 * 2. Clock In/Out with GPS capture
 * 3. Capture patient signature
 * 4. Update documentation status
 * 5. View patient information
 *
 * Data flows to the POC Monitor via pointOfCareGateway.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '../components/ui/utils';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Clock, MapPin, CheckCircle, Play, Square, FileText, User,
  ChevronRight, Phone, AlertTriangle, Navigation, ArrowLeft,
  Smartphone, Wifi, WifiOff, Timer, CalendarCheck, Shield,
  PenTool, X, Check, Loader2, Activity, ChevronDown, ChevronUp,
} from 'lucide-react';
import GPSCapture from '../components/poc/GPSCapture';
import SignaturePad from '../components/poc/SignaturePad';
import { MOCK_VISITS } from '../components/poc/MonitorMockData';
import { pointOfCareGateway } from '../lib/dataGateway';
import type { MonitorVisit, VisitStatus, EvvStatus } from '../components/poc/MonitorTypes';
import { VISIT_STATUS_CONFIG, EVV_STATUS_CONFIG } from '../components/poc/MonitorTypes';

// ─── Simulated caregiver profile ────────────────────────────────────────────

const CAREGIVER_PROFILE = {
  id: 'cg-301',
  name: 'Sarah Johnson, RN',
  discipline: 'SN',
  phone: '(555) 123-4567',
  avatar: 'SJ',
};

// ─── Clock-in state for tracking ────────────────────────────────────────────

interface ClockEvent {
  type: 'clock_in' | 'clock_out';
  time: string;
  gps?: { lat: number; lng: number; accuracy: number };
  signature?: string;
}

// ─── Mobile Header ──────────────────────────────────────────────────────────

function MobileHeader({ caregiverName, activeCount }: { caregiverName: string; activeCount: number }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 pt-4 pb-5 rounded-b-2xl shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="size-4 opacity-70" />
          <span className="text-[10px] font-medium opacity-70">FIELD APP</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="size-3.5 opacity-70" />
          <span className="text-xs tabular-nums font-medium">{timeStr}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
          <span className="text-lg font-bold">{CAREGIVER_PROFILE.avatar}</span>
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-tight">{caregiverName}</h1>
          <p className="text-xs text-blue-100">{dateStr}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="bg-white/15 rounded-xl px-3 py-1.5 flex items-center gap-2">
          <CalendarCheck className="size-3.5" />
          <span className="text-xs font-semibold">{activeCount} visits today</span>
        </div>
        <div className="bg-white/15 rounded-xl px-3 py-1.5 flex items-center gap-2">
          <Shield className="size-3.5" />
          <span className="text-xs font-semibold">EVV Active</span>
        </div>
      </div>
    </div>
  );
}

// ─── Visit Card ─────────────────────────────────────────────────────────────

interface VisitCardProps {
  visit: MonitorVisit;
  isExpanded: boolean;
  onToggle: () => void;
  onClockIn: () => void;
  onClockOut: () => void;
  onViewDetails: () => void;
  clockingIn: boolean;
  clockingOut: boolean;
}

const VisitCard = React.memo(function VisitCard({
  visit, isExpanded, onToggle, onClockIn, onClockOut, onViewDetails,
  clockingIn, clockingOut,
}: VisitCardProps) {
  const statusCfg = VISIT_STATUS_CONFIG[visit.status];
  const evvCfg = EVV_STATUS_CONFIG[visit.evvStatus];
  const canClockIn = visit.status === 'scheduled';
  const canClockOut = visit.status === 'in_progress' || visit.status === 'missing_clock_out';
  const isActive = visit.status === 'in_progress';
  const isCompleted = visit.status === 'completed';
  const hasAlert = visit.status === 'missing_clock_out' || visit.conflicts.length > 0;

  return (
    <div className={cn(
      'rounded-2xl border-2 transition-all overflow-hidden',
      isActive ? 'border-blue-300 bg-blue-50/50 shadow-md shadow-blue-100' :
      hasAlert ? 'border-red-200 bg-red-50/30' :
      isCompleted ? 'border-emerald-200 bg-emerald-50/30' :
      'border-gray-200 bg-white',
    )}>
      {/* Card header (always visible) */}
      <button
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
        onClick={onToggle}
      >
        {/* Status indicator */}
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
          isActive ? 'bg-blue-100' :
          isCompleted ? 'bg-emerald-100' :
          hasAlert ? 'bg-red-100' :
          'bg-gray-100',
        )}>
          {isActive ? <Activity className="size-5 text-blue-600 animate-pulse" /> :
           isCompleted ? <CheckCircle className="size-5 text-emerald-600" /> :
           hasAlert ? <AlertTriangle className="size-5 text-red-500" /> :
           <Clock className="size-5 text-gray-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold text-gray-900 truncate">{visit.patientName}</p>
            {isActive && (
              <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {visit.visitType} • {visit.scheduledTime}
            {visit.actualStartTime ? ` → ${visit.actualStartTime}` : ''}
            {visit.actualEndTime ? ` – ${visit.actualEndTime}` : ''}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full',
              statusCfg.bg, statusCfg.color,
            )}>
              {statusCfg.label}
            </span>
            <span className={cn(
              'text-[10px] font-medium px-2 py-0.5 rounded-full',
              evvCfg.bg, evvCfg.color,
            )}>
              EVV: {evvCfg.label}
            </span>
          </div>
        </div>

        {isExpanded ? <ChevronUp className="size-4 text-gray-400 shrink-0" /> :
                      <ChevronDown className="size-4 text-gray-400 shrink-0" />}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Patient info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-gray-400 block text-[10px] mb-0.5">MRN</span>
              <span className="font-semibold text-gray-700">{visit.patientMrn}</span>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-gray-400 block text-[10px] mb-0.5">Admission</span>
              <span className="font-semibold text-gray-700 truncate block">{visit.admissionLabel}</span>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-gray-400 block text-[10px] mb-0.5">Discipline</span>
              <span className="font-semibold text-gray-700">{visit.discipline}</span>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-gray-400 block text-[10px] mb-0.5">Doc Status</span>
              <span className="font-semibold text-gray-700">{visit.docStatus}</span>
            </div>
          </div>

          {/* Conflict warning */}
          {hasAlert && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-500 shrink-0" />
              <span className="text-xs text-red-700 font-medium">
                {visit.status === 'missing_clock_out'
                  ? 'Missing clock out — please clock out now'
                  : visit.conflicts.map(c => c.replace(/_/g, ' ')).join(', ')}
              </span>
            </div>
          )}

          {/* Authorization warning */}
          {visit.authorizationRemaining !== undefined && visit.authorizationRemaining <= 2 && (
            <div className={cn(
              'border rounded-xl px-3 py-2 flex items-center gap-2',
              visit.authorizationRemaining === 0
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200',
            )}>
              <Shield className={cn('size-4', visit.authorizationRemaining === 0 ? 'text-red-500' : 'text-amber-500')} />
              <span className={cn('text-xs font-medium', visit.authorizationRemaining === 0 ? 'text-red-700' : 'text-amber-700')}>
                {visit.authorizationRemaining === 0
                  ? 'No authorized visits remaining — contact supervisor'
                  : `Only ${visit.authorizationRemaining} authorized visit${visit.authorizationRemaining !== 1 ? 's' : ''} remaining`}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {canClockIn && (
              <Button
                className="flex-1 h-12 rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-base font-bold shadow-md"
                onClick={onClockIn}
                disabled={clockingIn}
              >
                {clockingIn ? <Loader2 className="size-5 animate-spin" /> : <Play className="size-5" />}
                Clock In
              </Button>
            )}
            {canClockOut && (
              <Button
                className="flex-1 h-12 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-base font-bold shadow-md"
                onClick={onClockOut}
                disabled={clockingOut}
              >
                {clockingOut ? <Loader2 className="size-5 animate-spin" /> : <Square className="size-5" />}
                Clock Out
              </Button>
            )}
            <Button
              variant="outline"
              className="h-12 rounded-xl px-4"
              onClick={onViewDetails}
            >
              <FileText className="size-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Clock-In Flow Modal ────────────────────────────────────────────────────

interface ClockFlowProps {
  visit: MonitorVisit;
  mode: 'clock_in' | 'clock_out';
  onComplete: (event: ClockEvent) => void;
  onCancel: () => void;
}

function ClockFlow({ visit, mode, onComplete, onCancel }: ClockFlowProps) {
  const [step, setStep] = useState<'gps' | 'signature' | 'confirm'>('gps');
  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isClockOut = mode === 'clock_out';

  const handleGpsCapture = useCallback((lat: number, lng: number, accuracy: number) => {
    setGps({ lat, lng, accuracy });
    // Auto-advance after GPS capture
    setTimeout(() => {
      setStep(isClockOut ? 'signature' : 'confirm');
    }, 800);
  }, [isClockOut]);

  const handleSignatureSave = useCallback((dataUrl: string) => {
    setSignature(dataUrl);
    setStep('confirm');
  }, []);

  const handleConfirm = useCallback(async () => {
    setSubmitting(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    onComplete({
      type: mode,
      time: timeStr,
      gps: gps || undefined,
      signature: signature || undefined,
    });
    setSubmitting(false);
  }, [mode, gps, signature, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className={cn(
        'shrink-0 px-4 py-4',
        isClockOut ? 'bg-blue-600' : 'bg-emerald-600',
      )}>
        <div className="flex items-center justify-between text-white mb-3">
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-white/10">
            <ArrowLeft className="size-5" />
          </button>
          <span className="text-sm font-bold">
            {isClockOut ? 'Clock Out' : 'Clock In'} — EVV Verification
          </span>
          <div className="w-6" />
        </div>
        <div className="text-white/80 text-xs text-center">
          {visit.patientName} • {visit.visitType}
        </div>
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {['gps', ...(isClockOut ? ['signature'] : []), 'confirm'].map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2',
                step === s ? 'bg-white text-emerald-600 border-white' :
                ['gps', ...(isClockOut ? ['signature'] : []), 'confirm'].indexOf(step) > idx
                  ? 'bg-white/30 text-white border-white/50'
                  : 'bg-transparent text-white/50 border-white/30',
              )}>
                {idx + 1}
              </div>
              {idx < (isClockOut ? 2 : 1) && (
                <div className={cn('w-8 h-0.5', step === s ? 'bg-white/30' : 'bg-white/20')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {step === 'gps' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <MapPin className="size-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Verify Location</h2>
              <p className="text-sm text-gray-500 mt-1">
                Capturing GPS coordinates for EVV compliance
              </p>
            </div>
            <GPSCapture
              patientId={visit.patientId}
              hasConsent={true}
              onCapture={handleGpsCapture}
              autoCapture={true}
            />
            {gps && (
              <div className="mt-4 flex justify-center">
                <Button
                  className="h-12 rounded-xl px-8 gap-2"
                  onClick={() => setStep(isClockOut ? 'signature' : 'confirm')}
                >
                  Continue <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'signature' && isClockOut && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <PenTool className="size-8 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Patient Signature</h2>
              <p className="text-sm text-gray-500 mt-1">
                Collect patient signature to confirm visit completion
              </p>
            </div>
            <div className="flex justify-center">
              <SignaturePad
                onSave={handleSignatureSave}
                onCancel={() => setStep('gps')}
                width={Math.min(window.innerWidth - 48, 500)}
                height={180}
              />
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3',
                isClockOut ? 'bg-blue-100' : 'bg-emerald-100',
              )}>
                <CheckCircle className={cn('size-8', isClockOut ? 'text-blue-600' : 'text-emerald-600')} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Confirm {isClockOut ? 'Clock Out' : 'Clock In'}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Review the details below and confirm
              </p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Patient</span>
                <span className="font-semibold text-gray-800">{visit.patientName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Visit Type</span>
                <span className="font-semibold text-gray-800">{visit.visitType}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold text-gray-800 tabular-nums">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {gps && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">GPS</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="size-3.5" /> Verified (±{Math.round(gps.accuracy)}m)
                  </span>
                </div>
              )}
              {signature && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Signature</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="size-3.5" /> Captured
                  </span>
                </div>
              )}
            </div>

            {/* HIPAA notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <Shield className="size-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700 leading-relaxed">
                This {isClockOut ? 'clock out' : 'clock in'} event will be recorded in the EVV system per 21st Century Cures Act requirements. GPS and timestamp data are encrypted and transmitted securely.
              </p>
            </div>

            <Button
              className={cn(
                'w-full h-14 rounded-2xl gap-2 text-lg font-bold shadow-lg',
                isClockOut ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700',
              )}
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <>
                  {isClockOut ? <Square className="size-5" /> : <Play className="size-5" />}
                  Confirm {isClockOut ? 'Clock Out' : 'Clock In'}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Visit Detail View ──────────────────────────────────────────────────────

function VisitDetailView({ visit, onBack }: { visit: MonitorVisit; onBack: () => void }) {
  const statusCfg = VISIT_STATUS_CONFIG[visit.status];
  const evvCfg = EVV_STATUS_CONFIG[visit.evvStatus];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="shrink-0 px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-200">
          <ArrowLeft className="size-5 text-gray-600" />
        </button>
        <h2 className="text-base font-bold text-gray-900">Visit Details</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Patient */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Patient</h3>
            <p className="text-lg font-bold text-gray-900">{visit.patientName}</p>
            <p className="text-sm text-gray-500">{visit.patientMrn} • {visit.admissionLabel}</p>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className={cn('rounded-2xl p-4 border', statusCfg.bg, statusCfg.color)}>
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Visit Status</span>
              <p className="text-sm font-bold mt-1">{statusCfg.label}</p>
            </div>
            <div className={cn('rounded-2xl p-4 border', evvCfg.bg, evvCfg.color)}>
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">EVV</span>
              <p className="text-sm font-bold mt-1">{evvCfg.label}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Timeline</h3>
            <div className="space-y-3">
              <TimelineStep label="Scheduled" time={visit.scheduledTime} done />
              <TimelineStep
                label="Clock In"
                time={visit.actualStartTime || '—'}
                done={!!visit.actualStartTime}
                active={visit.status === 'scheduled'}
              />
              <TimelineStep
                label="Clock Out"
                time={visit.actualEndTime || (visit.status === 'missing_clock_out' ? 'MISSING' : '—')}
                done={!!visit.actualEndTime}
                error={visit.status === 'missing_clock_out'}
                active={visit.status === 'in_progress'}
              />
              <TimelineStep
                label="EVV Transmitted"
                time={visit.evvStatus === 'transmitted' || visit.evvStatus === 'verified' ? 'Sent' : '—'}
                done={visit.evvStatus === 'transmitted' || visit.evvStatus === 'verified'}
                error={visit.evvStatus === 'evv_error'}
              />
            </div>
          </div>

          {/* Visit Info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Visit Info</h3>
            <InfoLine label="Type" value={visit.visitType} />
            <InfoLine label="Discipline" value={visit.discipline} />
            <InfoLine label="Date" value={visit.scheduledDate} />
            {visit.authorizationRemaining !== undefined && (
              <InfoLine
                label="Auth Remaining"
                value={`${visit.authorizationRemaining} visits`}
                danger={visit.authorizationRemaining === 0}
              />
            )}
            {visit.notes && <InfoLine label="Notes" value={visit.notes} />}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

function TimelineStep({ label, time, done, active, error }: {
  label: string; time: string; done?: boolean; active?: boolean; error?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'w-3 h-3 rounded-full border-2 shrink-0',
        done ? 'bg-emerald-500 border-emerald-500' :
        active ? 'bg-blue-500 border-blue-500 animate-pulse' :
        error ? 'bg-red-500 border-red-500' :
        'bg-white border-gray-300',
      )} />
      <div className="flex-1 flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <span className={cn(
          'text-sm tabular-nums font-medium',
          error ? 'text-red-600 font-bold' : done ? 'text-gray-800' : 'text-gray-400',
        )}>{time}</span>
      </div>
    </div>
  );
}

function InfoLine({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={cn('text-xs font-medium', danger ? 'text-red-600 font-bold' : 'text-gray-800')}>
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CaregiverFieldApp() {
  const [visits, setVisits] = useState<MonitorVisit[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [clockFlow, setClockFlow] = useState<{ visit: MonitorVisit; mode: 'clock_in' | 'clock_out' } | null>(null);
  const [clockingVisitId, setClockingVisitId] = useState<string | null>(null);
  const [clockMode, setClockMode] = useState<'in' | 'out' | null>(null);
  const [detailVisit, setDetailVisit] = useState<MonitorVisit | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Load visits for this caregiver
  useEffect(() => {
    async function loadVisits() {
      const today = new Date().toISOString().split('T')[0];
      try {
        const serverVisits = await pointOfCareGateway.getMonitorVisits(today);
        if (serverVisits.length > 0) {
          // Filter to this caregiver's visits
          const myVisits = serverVisits
            .filter((v: any) => v.caregiverId === CAREGIVER_PROFILE.id)
            .map((sv: any) => ({
              id: sv.id,
              patientId: sv.patientId || '',
              patientName: sv.patientName || '',
              patientMrn: sv.patientMrn || '',
              admissionId: sv.admissionId || '',
              admissionLabel: sv.admissionLabel || '',
              caregiverId: sv.caregiverId || '',
              caregiverName: sv.caregiverName || '',
              discipline: sv.discipline || '',
              visitType: sv.visitType || '',
              scheduledDate: sv.scheduledDate || '',
              scheduledTime: sv.scheduledTime || '',
              actualStartTime: sv.actualStartTime || undefined,
              actualEndTime: sv.actualEndTime || undefined,
              status: sv.status as VisitStatus,
              evvStatus: sv.evvStatus as EvvStatus,
              docStatus: sv.docStatus || 'n/a',
              conflicts: sv.conflicts || [],
              authorizationRemaining: sv.authorizationRemaining,
              notes: sv.notes || '',
            } as MonitorVisit));
          if (myVisits.length > 0) {
            setVisits(myVisits);
            setIsLive(true);
            return;
          }
        }
      } catch { /* fallback below */ }

      // Fallback to mock data for this caregiver
      const myMockVisits = MOCK_VISITS.filter(v => v.caregiverId === CAREGIVER_PROFILE.id);
      setVisits(myMockVisits);
      setIsLive(false);
    }
    loadVisits();
  }, []);

  // Sort: in_progress first, then missing_clock_out, scheduled, completed
  const sortedVisits = useMemo(() => {
    const order: Record<string, number> = {
      in_progress: 0, missing_clock_out: 1, scheduled: 2, completed: 3, missed: 4, cancelled: 5,
    };
    return [...visits].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  }, [visits]);

  const activeCount = useMemo(() =>
    visits.filter(v => v.status !== 'completed' && v.status !== 'cancelled').length,
    [visits]
  );

  // ─── Clock handlers ────────────────────────────────────────────────────

  const handleStartClockIn = useCallback((visit: MonitorVisit) => {
    setClockFlow({ visit, mode: 'clock_in' });
  }, []);

  const handleStartClockOut = useCallback((visit: MonitorVisit) => {
    setClockFlow({ visit, mode: 'clock_out' });
  }, []);

  const handleClockComplete = useCallback(async (event: ClockEvent) => {
    if (!clockFlow) return;
    const { visit, mode } = clockFlow;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (mode === 'clock_in') {
      // Update server
      try {
        await pointOfCareGateway.updateVisit(visit.id, {
          status: 'in_progress',
          evv_clock_in: now.toISOString(),
        });
      } catch { /* optimistic */ }

      setVisits(prev => prev.map(v =>
        v.id === visit.id ? {
          ...v,
          status: 'in_progress' as const,
          evvStatus: 'clocked_in' as EvvStatus,
          actualStartTime: timeStr,
        } : v
      ));
      toast.success(`Clocked in at ${timeStr} — GPS verified`, { duration: 4000 });
    } else {
      // Clock out
      try {
        await pointOfCareGateway.updateVisit(visit.id, {
          status: 'completed',
          evv_clock_out: now.toISOString(),
        });
      } catch { /* optimistic */ }

      setVisits(prev => prev.map(v =>
        v.id === visit.id ? {
          ...v,
          status: 'completed' as const,
          evvStatus: 'transmitted' as EvvStatus,
          actualEndTime: timeStr,
          docStatus: 'pending' as const,
        } : v
      ));
      toast.success(`Clocked out at ${timeStr} — EVV transmitted${event.signature ? ' & signature captured' : ''}`, { duration: 4000 });
    }

    setClockFlow(null);
  }, [clockFlow]);

  // ─── Render ─────────────────────────────────────────────────────────────

  // If a clock flow is active, show that
  if (clockFlow) {
    return (
      <ClockFlow
        visit={clockFlow.visit}
        mode={clockFlow.mode}
        onComplete={handleClockComplete}
        onCancel={() => setClockFlow(null)}
      />
    );
  }

  // If viewing visit details
  if (detailVisit) {
    return <VisitDetailView visit={detailVisit} onBack={() => setDetailVisit(null)} />;
  }

  return (
    <div className="size-full flex items-center justify-center bg-gray-100 p-4">
      {/* Mobile phone frame */}
      <div className="w-full max-w-[420px] h-full max-h-[850px] bg-white rounded-[32px] shadow-2xl border-[6px] border-gray-800 overflow-hidden flex flex-col relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-gray-800 rounded-b-2xl z-10" />

        {/* Screen content */}
        <div className="flex-1 flex flex-col overflow-hidden pt-6">
          <MobileHeader caregiverName={CAREGIVER_PROFILE.name} activeCount={activeCount} />

          {/* Data source indicator */}
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Today's Schedule</span>
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border',
              isLive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700',
            )}>
              {isLive ? <Wifi className="size-2.5" /> : <WifiOff className="size-2.5" />}
              {isLive ? 'Live' : 'Demo'}
            </span>
          </div>

          {/* Visit list */}
          <ScrollArea className="flex-1 px-4 pb-4">
            <div className="space-y-3 pb-4">
              {sortedVisits.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarCheck className="size-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No visits scheduled today</p>
                </div>
              ) : (
                sortedVisits.map(visit => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    isExpanded={expandedId === visit.id}
                    onToggle={() => setExpandedId(expandedId === visit.id ? null : visit.id)}
                    onClockIn={() => handleStartClockIn(visit)}
                    onClockOut={() => handleStartClockOut(visit)}
                    onViewDetails={() => setDetailVisit(visit)}
                    clockingIn={clockingVisitId === visit.id && clockMode === 'in'}
                    clockingOut={clockingVisitId === visit.id && clockMode === 'out'}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          {/* Bottom nav */}
          <div className="shrink-0 px-4 py-3 border-t border-gray-200 bg-white flex items-center justify-around">
            <button className="flex flex-col items-center gap-0.5 text-blue-600">
              <CalendarCheck className="size-5" />
              <span className="text-[9px] font-semibold">Schedule</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 text-gray-400">
              <Navigation className="size-5" />
              <span className="text-[9px] font-medium">Navigate</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 text-gray-400">
              <FileText className="size-5" />
              <span className="text-[9px] font-medium">Docs</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 text-gray-400">
              <User className="size-5" />
              <span className="text-[9px] font-medium">Profile</span>
            </button>
          </div>
        </div>

        {/* Home indicator */}
        <div className="shrink-0 flex justify-center py-2 bg-white">
          <div className="w-32 h-1 bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
