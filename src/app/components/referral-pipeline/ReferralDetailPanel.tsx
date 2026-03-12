/**
 * ReferralDetailPanel — Full-width side drawer for viewing referral details.
 * Sections: Patient Info, Referral Documents, Clinical Notes, Insurance Verification,
 * Assigned Coordinator, Communication History (timeline), and stage advance/back actions.
 */
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  Shield,
  FileText,
  ChevronRight,
  Send,
  Loader2,
  Clock,
  Building2,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  X,
  MessageCircle,
  Paperclip,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import type { Referral, PipelineStage, ReferralNote } from '../../lib/referralPipelineTypes';
import {
  getUrgencyConfig,
  getStageConfig,
  PIPELINE_STAGES,
  STAGE_CONFIGS,
  SERVICE_LABELS,
  SOURCE_LABELS,
} from '../../lib/referralPipelineTypes';
import { referralPipelineGateway } from '../../lib/dataGateway';

// ─── Info Row ───────────────────────────────────────────────────────────────

const InfoRow = React.memo(function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className="size-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</div>
        <div className="text-sm text-gray-800 leading-snug">{value}</div>
      </div>
    </div>
  );
});

// ─── Stage Progress ─────────────────────────────────────────────────────────

const StageProgress = React.memo(function StageProgress({
  currentStage,
}: {
  currentStage: PipelineStage;
}) {
  const currentIdx = PIPELINE_STAGES.indexOf(currentStage);
  const isRejected = currentStage === 'rejected';

  return (
    <div className="flex items-center gap-0.5 w-full">
      {STAGE_CONFIGS.filter(s => s.id !== 'rejected').map((stage, idx) => {
        const isComplete = !isRejected && idx < currentIdx;
        const isCurrent = !isRejected && idx === currentIdx;

        return (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center flex-1 gap-1">
              <div className="flex items-center gap-0.5 w-full">
                <div
                  className={cn(
                    'h-2 flex-1 rounded-full transition-colors',
                    isComplete
                      ? 'bg-emerald-400'
                      : isCurrent
                        ? 'bg-blue-500'
                        : isRejected
                          ? 'bg-red-200'
                          : 'bg-gray-200',
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[9px] font-semibold',
                  isComplete
                    ? 'text-emerald-600'
                    : isCurrent
                      ? 'text-blue-600'
                      : isRejected
                        ? 'text-red-400'
                        : 'text-gray-400',
                )}
              >
                {stage.shortLabel}
              </span>
            </div>
            {idx < STAGE_CONFIGS.filter(s => s.id !== 'rejected').length - 1 && (
              <ChevronRight
                className={cn(
                  'size-3 shrink-0 -mt-3',
                  isComplete ? 'text-emerald-400' : 'text-gray-300',
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});

// ─── Timeline Note ──────────────────────────────────────────────────────────

const TimelineNote = React.memo(function TimelineNote({ note }: { note: ReferralNote }) {
  const stageConfig = getStageConfig(note.stage);
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', stageConfig.iconBg)} />
        <div className="w-px flex-1 bg-gray-100 mt-1" />
      </div>
      <div className="pb-4 min-w-0 flex-1">
        <p className="text-sm text-gray-800 leading-snug">{note.text}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500 font-medium">{note.author}</span>
          <span className="text-xs text-gray-300">&middot;</span>
          <span className="text-xs text-gray-400">
            {new Date(note.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
          <Badge
            variant="outline"
            className={cn(
              'text-[9px] h-4 px-1.5 rounded-full',
              stageConfig.bgColor,
              stageConfig.borderColor,
              stageConfig.color,
            )}
          >
            {stageConfig.shortLabel}
          </Badge>
        </div>
      </div>
    </div>
  );
});

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, count }: { icon: React.ElementType; title: string; count?: number }) {
  return (
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
      <Icon className="size-4 text-gray-400" />
      {title}
      {count !== undefined && (
        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 rounded-full">
          {count}
        </Badge>
      )}
    </h3>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

interface ReferralDetailPanelProps {
  referral: Referral;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (referral: Referral) => void;
}

export const ReferralDetailPanel = React.memo(function ReferralDetailPanel({
  referral,
  open,
  onOpenChange,
  onUpdated,
}: ReferralDetailPanelProps) {
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [movingTo, setMovingTo] = useState<PipelineStage | null>(null);

  const stageConfig = getStageConfig(referral.stage);
  const urgencyConfig = getUrgencyConfig(referral.urgency);
  const currentIdx = PIPELINE_STAGES.indexOf(referral.stage);
  const mainStages = STAGE_CONFIGS.filter(s => s.id !== 'rejected');
  const mainIdx = mainStages.findIndex(s => s.id === referral.stage);
  const nextStage = mainIdx >= 0 && mainIdx < mainStages.length - 1 ? mainStages[mainIdx + 1] : null;
  const prevStage = mainIdx > 0 ? mainStages[mainIdx - 1] : null;

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim()) return;
    try {
      setAddingNote(true);
      const res = await referralPipelineGateway.addNote(referral.id, noteText.trim(), 'Current User');
      onUpdated(res.referral);
      setNoteText('');
      toast.success('Note added');
    } catch (err: any) {
      console.error('[ReferralDetail] Add note error:', err);
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  }, [referral.id, noteText, onUpdated]);

  const handleMoveStage = useCallback(
    async (toStage: PipelineStage) => {
      try {
        setMovingTo(toStage);
        const res = await referralPipelineGateway.moveStage(referral.id, {
          toStage,
          note: `Moved to ${getStageConfig(toStage).label}`,
          movedBy: 'Current User',
        });
        onUpdated(res.referral);
        toast.success(`Moved to ${getStageConfig(toStage).label}`);
      } catch (err: any) {
        console.error('[ReferralDetail] Move error:', err);
        toast.error('Failed to move referral');
      } finally {
        setMovingTo(null);
      }
    },
    [referral.id, onUpdated],
  );

  const age = Math.floor(
    (Date.now() - new Date(referral.patientDob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[520px] bg-white z-50 shadow-2xl flex flex-col border-l border-gray-200">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className={cn('px-6 py-5 border-b shrink-0', stageConfig.bgColor, stageConfig.borderColor)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold', stageConfig.iconBg, stageConfig.color)}>
                {referral.patientFirstName[0]}
                {referral.patientLastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  {referral.patientLastName}, {referral.patientFirstName}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className={cn('text-[10px] h-5 px-2 rounded-full font-bold', urgencyConfig.bg, urgencyConfig.border, urgencyConfig.text)}>
                    {urgencyConfig.label}
                  </Badge>
                  <Badge variant="outline" className={cn('text-[10px] h-5 px-2 rounded-full', stageConfig.bgColor, stageConfig.borderColor, stageConfig.color)}>
                    {stageConfig.label}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {referral.daysTotal}d total &middot; {referral.daysInStage}d in stage
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onOpenChange(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <StageProgress currentStage={referral.stage} />
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">
            {/* Stage Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {prevStage && referral.stage !== 'rejected' && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => handleMoveStage(prevStage.id)} disabled={!!movingTo}>
                  {movingTo === prevStage.id ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowLeft className="size-3.5" />}
                  Back to {prevStage.shortLabel}
                </Button>
              )}
              {nextStage && referral.stage !== 'rejected' && (
                <Button size="sm" className="gap-1.5 text-xs" onClick={() => handleMoveStage(nextStage.id)} disabled={!!movingTo}>
                  {movingTo === nextStage.id ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowRight className="size-3.5" />}
                  Advance to {nextStage.shortLabel}
                </Button>
              )}
              {referral.stage === 'admitted' && (
                <Badge variant="outline" className="text-xs h-8 px-3 bg-emerald-50 border-emerald-300 text-emerald-700 gap-1.5">
                  <CheckCircle2 className="size-4" />
                  Patient Admitted
                </Badge>
              )}
              {referral.stage === 'rejected' && (
                <>
                  <Badge variant="outline" className="text-xs h-8 px-3 bg-red-50 border-red-300 text-red-700 gap-1.5">
                    <AlertTriangle className="size-4" />
                    Referral Rejected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => handleMoveStage('new_referral')}
                    disabled={!!movingTo}
                  >
                    {movingTo === 'new_referral' ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
                    Re-open as New Referral
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => handleMoveStage('insurance_verification')}
                    disabled={!!movingTo}
                  >
                    {movingTo === 'insurance_verification' ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowRight className="size-3.5" />}
                    Re-open to Insurance
                  </Button>
                </>
              )}
            </div>

            {/* ── Patient Information ──────────────────────────────────── */}
            <div>
              <SectionHeader icon={User} title="Patient Information" />
              <div className="bg-gray-50 rounded-lg p-4 space-y-0.5 border border-gray-100">
                <InfoRow icon={User} label="DOB / Age" value={`${referral.patientDob} (${age}y)`} />
                <InfoRow icon={Phone} label="Phone" value={referral.patientPhone || 'N/A'} />
                <InfoRow icon={MapPin} label="Address" value={referral.patientAddress || 'N/A'} />
                <InfoRow icon={Calendar} label="Referral Date" value={referral.referralDate} />
                <InfoRow icon={Building2} label="Referral Source" value={
                  <span>
                    {SOURCE_LABELS[referral.source] || referral.source}
                    {referral.sourceDetails && <span className="text-gray-500"> — {referral.sourceDetails}</span>}
                  </span>
                } />
                <InfoRow icon={Stethoscope} label="Referring Physician" value={`${referral.referringPhysician}${referral.referringPhysicianNpi ? ` (NPI: ${referral.referringPhysicianNpi})` : ''}`} />
              </div>
            </div>

            {/* ── Clinical Notes ───────────────────────────────────────── */}
            <div>
              <SectionHeader icon={Stethoscope} title="Clinical Information" />
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-0.5">
                  <InfoRow icon={Stethoscope} label="Primary Dx" value={`${referral.primaryDiagnosis}${referral.primaryDiagnosisIcd ? ` (${referral.primaryDiagnosisIcd})` : ''}`} />
                  {referral.secondaryDiagnoses.length > 0 && (
                    <InfoRow icon={FileText} label="Secondary Dx" value={referral.secondaryDiagnoses.join(', ')} />
                  )}
                  <InfoRow
                    icon={FileText}
                    label="Requested Services"
                    value={
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {referral.requestedServices.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px] h-5 px-1.5">
                            {SERVICE_LABELS[s] || s}
                          </Badge>
                        ))}
                      </div>
                    }
                  />
                </div>
                {referral.clinicalNotes && (
                  <div className="bg-blue-50/50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed border border-blue-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1.5">Clinical Notes</p>
                    {referral.clinicalNotes}
                  </div>
                )}
              </div>
            </div>

            {/* ── Insurance Verification ──��────────────────────────────── */}
            <div>
              <SectionHeader icon={Shield} title="Insurance Verification" />
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-0.5">
                <InfoRow icon={Shield} label="Insurance Plan" value={referral.insurancePlan || 'Not provided'} />
                <InfoRow icon={Shield} label="Member ID" value={referral.insuranceId || 'N/A'} />
                <InfoRow
                  icon={Shield}
                  label="Auth Status"
                  value={
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] h-5 px-2 rounded-full',
                        referral.authorizationStatus === 'approved'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : referral.authorizationStatus === 'denied'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700',
                      )}
                    >
                      {referral.authorizationStatus}
                      {referral.authorizationNumber ? ` (${referral.authorizationNumber})` : ''}
                    </Badge>
                  }
                />
                {referral.scheduledStartDate && (
                  <InfoRow icon={Calendar} label="Scheduled SOC" value={referral.scheduledStartDate} />
                )}
              </div>
            </div>

            {/* ── Assigned Coordinator / Clinician ─────────────────────── */}
            <div>
              <SectionHeader icon={User} title="Assigned Personnel" />
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-0.5">
                <InfoRow icon={User} label="Intake Coordinator" value={referral.assignedTo || 'Unassigned'} />
                {referral.assignedClinician && (
                  <InfoRow icon={Stethoscope} label="Assigned Clinician" value={referral.assignedClinician} />
                )}
                <InfoRow icon={Building2} label="Office" value={referral.assignedOffice || 'N/A'} />
              </div>
            </div>

            {/* ── Referral Documents ───────────────────────────────────── */}
            <div>
              <SectionHeader icon={Paperclip} title="Referral Documents" />
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="space-y-2">
                  {/* Static document list for pipeline context */}
                  {[
                    { name: 'Referral Form', status: 'received', date: referral.referralDate },
                    { name: 'Face-to-Face Documentation', status: referral.stage === 'new_referral' ? 'pending' : 'received', date: '' },
                    { name: 'Insurance Card Copy', status: referral.insurancePlan ? 'received' : 'pending', date: '' },
                    { name: 'Medical History / H&P', status: referral.clinicalNotes ? 'received' : 'pending', date: '' },
                    { name: 'Discharge Summary', status: referral.source === 'hospital_discharge' ? 'received' : 'n/a', date: '' },
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="size-3.5 text-gray-400" />
                        <span className="text-gray-700">{doc.name}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[9px] h-4 px-1.5 rounded-full',
                          doc.status === 'received'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : doc.status === 'pending'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-gray-50 border-gray-200 text-gray-400',
                        )}
                      >
                        {doc.status === 'received' ? 'Received' : doc.status === 'pending' ? 'Pending' : 'N/A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Communication History (Activity Timeline) ────────────── */}
            <div>
              <SectionHeader icon={MessageCircle} title="Communication History" count={referral.notes?.length || 0} />
              <div>
                {(referral.notes || [])
                  .slice()
                  .reverse()
                  .map((note) => (
                    <TimelineNote key={note.id} note={note} />
                  ))}
              </div>
            </div>

            {/* ── Add Note ─────────────────────────────────────────────── */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Send className="size-4 text-gray-400" />
                Add Communication Note
              </h3>
              <div className="flex gap-2">
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add an activity note or communication..."
                  className="text-sm min-h-[70px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                />
                <Button size="sm" className="h-auto shrink-0 gap-1.5 px-3" onClick={handleAddNote} disabled={!noteText.trim() || addingNote}>
                  {addingNote ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Ctrl+Enter to submit</p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
});

export default ReferralDetailPanel;