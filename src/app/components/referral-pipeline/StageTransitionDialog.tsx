/**
 * StageTransitionDialog — Prompts for required information when moving a
 * referral between specific pipeline stages.
 *
 * Stage-specific prompts:
 *  → Insurance Verification: insurance plan, insurance ID, auth status
 *  → Clinical Review:        assigned physician/reviewer
 *  → Admission Scheduled:    admission date, assigned clinician
 *  → Rejected:               rejection reason, notes
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Shield, Stethoscope, Calendar, XCircle, ArrowRight,
  Loader2, AlertTriangle, CheckCircle2, User,
} from 'lucide-react';
import type { Referral, PipelineStage } from '../../lib/referralPipelineTypes';
import { getStageConfig, SOURCE_LABELS } from '../../lib/referralPipelineTypes';
import { referralPipelineGateway } from '../../lib/dataGateway';

interface StageTransitionDialogProps {
  open: boolean;
  referral: Referral | null;
  toStage: PipelineStage;
  onClose: () => void;
  onTransitioned: (updated: Referral) => void;
}

// Stages that require a prompt
const PROMPTED_STAGES: PipelineStage[] = [
  'insurance_verification',
  'clinical_review',
  'admission_scheduled',
  'rejected',
];

export function requiresPrompt(toStage: PipelineStage): boolean {
  return PROMPTED_STAGES.includes(toStage);
}

export function StageTransitionDialog({
  open,
  referral,
  toStage,
  onClose,
  onTransitioned,
}: StageTransitionDialogProps) {
  const [saving, setSaving] = useState(false);

  // Insurance fields
  const [insurancePlan, setInsurancePlan] = useState('');
  const [insuranceId, setInsuranceId] = useState('');
  const [authStatus, setAuthStatus] = useState<string>('pending');

  // Clinical review fields
  const [assignedPhysician, setAssignedPhysician] = useState('');

  // Admission scheduled fields
  const [admissionDate, setAdmissionDate] = useState('');
  const [assignedClinician, setAssignedClinician] = useState('');

  // Rejected fields
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  // General notes
  const [transitionNote, setTransitionNote] = useState('');

  const stageConfig = getStageConfig(toStage);

  // Pre-fill from existing referral data
  useEffect(() => {
    if (!referral || !open) return;
    setInsurancePlan(referral.insurancePlan || '');
    setInsuranceId(referral.insuranceId || '');
    setAuthStatus(referral.authorizationStatus || 'pending');
    setAssignedPhysician(referral.referringPhysician || '');
    setAdmissionDate(referral.preferredStartDate || '');
    setAssignedClinician(referral.assignedClinician || '');
    setRejectionReason('');
    setRejectionNotes('');
    setTransitionNote('');
  }, [referral, open]);

  const isValid = useMemo(() => {
    switch (toStage) {
      case 'insurance_verification':
        return !!insurancePlan.trim();
      case 'clinical_review':
        return !!assignedPhysician.trim();
      case 'admission_scheduled':
        return !!admissionDate && !!assignedClinician.trim();
      case 'rejected':
        return !!rejectionReason.trim();
      default:
        return true;
    }
  }, [toStage, insurancePlan, assignedPhysician, admissionDate, assignedClinician, rejectionReason]);

  const handleSubmit = useCallback(async () => {
    if (!referral || !isValid) return;
    setSaving(true);

    try {
      // First, update the referral fields based on the stage
      const updates: Record<string, any> = {};
      let noteText = '';

      switch (toStage) {
        case 'insurance_verification':
          updates.insurancePlan = insurancePlan;
          updates.insuranceId = insuranceId;
          updates.authorizationStatus = authStatus;
          noteText = `Insurance verification initiated. Plan: ${insurancePlan}${insuranceId ? ` (ID: ${insuranceId})` : ''}. Auth status: ${authStatus}.`;
          break;

        case 'clinical_review':
          updates.assignedTo = assignedPhysician;
          noteText = `Clinical review assigned to ${assignedPhysician}.`;
          break;

        case 'admission_scheduled':
          updates.scheduledStartDate = admissionDate;
          updates.assignedClinician = assignedClinician;
          updates.assignedTo = assignedClinician;
          noteText = `Admission scheduled for ${admissionDate}. Assigned clinician: ${assignedClinician}.`;
          break;

        case 'rejected':
          noteText = `Referral rejected. Reason: ${rejectionReason}.${rejectionNotes ? ` Notes: ${rejectionNotes}` : ''}`;
          break;
      }

      if (transitionNote) {
        noteText += ` ${transitionNote}`;
      }

      // Update referral fields if any
      if (Object.keys(updates).length > 0) {
        await referralPipelineGateway.update(referral.id, updates);
      }

      // Move to new stage
      const res = await referralPipelineGateway.moveStage(referral.id, {
        toStage,
        note: noteText,
        movedBy: 'Current User',
      });

      toast.success(`Moved to ${stageConfig.label}`);
      onTransitioned(res.referral);
      onClose();
    } catch (err: any) {
      console.error('[StageTransitionDialog] error:', err);
      toast.error(err.message || 'Failed to transition referral');
    } finally {
      setSaving(false);
    }
  }, [referral, toStage, isValid, insurancePlan, insuranceId, authStatus, assignedPhysician, admissionDate, assignedClinician, rejectionReason, rejectionNotes, transitionNote, stageConfig, onTransitioned, onClose]);

  if (!referral) return null;

  const iconMap: Record<string, React.ReactNode> = {
    insurance_verification: <Shield className="size-5 text-amber-600" />,
    clinical_review: <Stethoscope className="size-5 text-purple-600" />,
    admission_scheduled: <Calendar className="size-5 text-teal-600" />,
    rejected: <XCircle className="size-5 text-red-600" />,
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {iconMap[toStage] || <ArrowRight className="size-5" />}
            Move to {stageConfig.label}
          </DialogTitle>
          <DialogDescription>
            Complete the required information to move{' '}
            <span className="font-semibold text-gray-800">
              {referral.patientLastName}, {referral.patientFirstName}
            </span>{' '}
            to {stageConfig.label}.
          </DialogDescription>
        </DialogHeader>

        {/* Patient context */}
        <div className={cn('rounded-lg p-3 border', stageConfig.bgColor, stageConfig.borderColor)}>
          <div className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold', stageConfig.iconBg, stageConfig.color)}>
              {referral.patientFirstName[0]}{referral.patientLastName[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {referral.patientLastName}, {referral.patientFirstName}
              </p>
              <p className="text-xs text-gray-500">
                DOB: {referral.patientDob} &middot; {referral.primaryDiagnosis}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* ── Insurance Verification Fields ────────────────────────────── */}
          {toStage === 'insurance_verification' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Insurance Plan <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={insurancePlan}
                  onChange={(e) => setInsurancePlan(e.target.value)}
                  placeholder="e.g., Medicare, Blue Cross Blue Shield"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Insurance ID / Member ID</Label>
                <Input
                  value={insuranceId}
                  onChange={(e) => setInsuranceId(e.target.value)}
                  placeholder="e.g., MCA-991233"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Authorization Status</Label>
                <Select value={authStatus} onValueChange={setAuthStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                    <SelectItem value="not_required">Not Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* ── Clinical Review Fields ───────────────────────────────────── */}
          {toStage === 'clinical_review' && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Assign Reviewing Physician / Clinician <span className="text-red-500">*</span>
              </Label>
              <Select value={assignedPhysician} onValueChange={setAssignedPhysician}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reviewer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Karen Lee">Dr. Karen Lee — Clinical Director</SelectItem>
                  <SelectItem value="Dr. Sarah Patel">Dr. Sarah Patel — Medical Director</SelectItem>
                  <SelectItem value="Dr. James Wu">Dr. James Wu — Attending Physician</SelectItem>
                  <SelectItem value="Dr. Emily Watson">Dr. Emily Watson — Consulting Physician</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-gray-500">
                The assigned physician will review clinical eligibility, homebound status, and medical necessity.
              </p>
            </div>
          )}

          {/* ── Admission Scheduled Fields ───────────────────────────────── */}
          {toStage === 'admission_scheduled' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Start of Care Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Assigned Clinician <span className="text-red-500">*</span>
                </Label>
                <Select value={assignedClinician} onValueChange={setAssignedClinician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select clinician..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Thompson, RN">Sarah Thompson, RN</SelectItem>
                    <SelectItem value="Maria Garcia, RN">Maria Garcia, RN</SelectItem>
                    <SelectItem value="John Williams, RN">John Williams, RN</SelectItem>
                    <SelectItem value="Lisa Nguyen, RN">Lisa Nguyen, RN</SelectItem>
                    <SelectItem value="David Park, PT">David Park, PT</SelectItem>
                    <SelectItem value="Amy Chen, OT">Amy Chen, OT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {referral.authorizationStatus !== 'approved' && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  Authorization is still <strong>{referral.authorizationStatus}</strong>. Ensure auth is approved before admission.
                </div>
              )}
            </>
          )}

          {/* ── Rejected Fields ──────────────────────────────────────────── */}
          {toStage === 'rejected' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Insurance denied">Insurance Denied</SelectItem>
                    <SelectItem value="Not clinically appropriate">Not Clinically Appropriate</SelectItem>
                    <SelectItem value="Patient declined services">Patient Declined Services</SelectItem>
                    <SelectItem value="Does not meet homebound criteria">Does Not Meet Homebound Criteria</SelectItem>
                    <SelectItem value="Service area not covered">Service Area Not Covered</SelectItem>
                    <SelectItem value="Duplicate referral">Duplicate Referral</SelectItem>
                    <SelectItem value="Insufficient clinical documentation">Insufficient Clinical Documentation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Additional Notes</Label>
                <Textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Provide additional context for the rejection..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertTriangle className="size-4 shrink-0" />
                This action will remove the referral from the active pipeline. This can be undone by moving the referral back to a previous stage.
              </div>
            </>
          )}

          {/* ── General Notes (all stages) ──────────────────────────────── */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-600">Transition Notes (optional)</Label>
            <Textarea
              value={transitionNote}
              onChange={(e) => setTransitionNote(e.target.value)}
              placeholder="Add any additional notes about this transition..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !isValid}
            className={cn('gap-1.5', toStage === 'rejected' ? 'bg-red-600 hover:bg-red-700' : '')}
          >
            {saving ? (
              <><Loader2 className="size-4 animate-spin" /> Processing...</>
            ) : toStage === 'rejected' ? (
              <><XCircle className="size-4" /> Reject Referral</>
            ) : (
              <><ArrowRight className="size-4" /> Confirm & Move</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StageTransitionDialog;
