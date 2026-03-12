/**
 * NewReferralForm — Multi-step wizard dialog for creating new referrals.
 * Steps: Patient → Source → Clinical → Insurance → Review
 */
import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  User,
  Building2,
  Stethoscope,
  Shield,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';
import { referralPipelineGateway } from '../../lib/dataGateway';
import type {
  NewReferralInput,
  ReferralUrgency,
  ReferralSource,
  ServiceType,
} from '../../lib/referralPipelineTypes';
import { SOURCE_LABELS, SERVICE_LABELS } from '../../lib/referralPipelineTypes';

// ─── Step Config ────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'patient', label: 'Patient Info', icon: User },
  { id: 'source', label: 'Referral Source', icon: Building2 },
  { id: 'clinical', label: 'Clinical', icon: Stethoscope },
  { id: 'insurance', label: 'Insurance', icon: Shield },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
] as const;

// ─── Progress Header ────────────────────────────────────────────────────────

const StepProgressBar = React.memo(function StepProgressBar({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (idx: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isComplete = idx < currentStep;
        const isCurrent = idx === currentStep;
        const isClickable = idx <= currentStep;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && onStepClick(idx)}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isComplete && 'text-emerald-700 cursor-pointer hover:bg-emerald-50',
                isCurrent && 'bg-blue-50 text-blue-700',
                !isComplete && !isCurrent && 'text-gray-400',
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  isComplete && 'bg-emerald-100',
                  isCurrent && 'bg-blue-100',
                  !isComplete && !isCurrent && 'bg-gray-100',
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="size-3 text-emerald-600" />
                ) : (
                  <Icon className={cn('size-3', isCurrent ? 'text-blue-600' : 'text-gray-400')} />
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <ChevronRight className={cn('size-3 shrink-0', isComplete ? 'text-emerald-300' : 'text-gray-300')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});

// ─── Field Wrapper ──────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs text-gray-600 font-medium mb-1 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="size-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Initial state ──────────────────────────────────────────────────────────

const EMPTY: NewReferralInput = {
  patientFirstName: '',
  patientLastName: '',
  patientDob: '',
  patientPhone: '',
  patientAddress: '',
  urgency: 'routine',
  source: 'hospital_discharge',
  sourceDetails: '',
  referringPhysician: '',
  referringPhysicianNpi: '',
  primaryDiagnosis: '',
  primaryDiagnosisIcd: '',
  secondaryDiagnoses: [],
  requestedServices: [],
  clinicalNotes: '',
  insurancePlan: '',
  insuranceId: '',
  preferredStartDate: '',
  assignedOffice: 'Main Office',
};

// ─── Component ──────────────────────────────────────────────────────────────

interface NewReferralFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export const NewReferralForm = React.memo(function NewReferralForm({
  open,
  onOpenChange,
  onCreated,
}: NewReferralFormProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<NewReferralInput>({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [secDxInput, setSecDxInput] = useState('');

  const set = useCallback(
    <K extends keyof NewReferralInput>(key: K, val: NewReferralInput[K]) => {
      setForm((f) => ({ ...f, [key]: val }));
      setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
    },
    [],
  );

  const toggleService = useCallback((svc: ServiceType) => {
    setForm((f) => ({
      ...f,
      requestedServices: f.requestedServices.includes(svc)
        ? f.requestedServices.filter((s) => s !== svc)
        : [...f.requestedServices, svc],
    }));
    setErrors((e) => { const n = { ...e }; delete n.requestedServices; return n; });
  }, []);

  const addSecDx = useCallback(() => {
    if (!secDxInput.trim()) return;
    setForm((f) => ({ ...f, secondaryDiagnoses: [...f.secondaryDiagnoses, secDxInput.trim()] }));
    setSecDxInput('');
  }, [secDxInput]);

  const removeSecDx = useCallback((i: number) => {
    setForm((f) => ({ ...f, secondaryDiagnoses: f.secondaryDiagnoses.filter((_, j) => j !== i) }));
  }, []);

  // ─── Validation ─────────────────────────────────────────────────────

  const validate = useCallback(
    (s: number): boolean => {
      const e: Record<string, string> = {};
      if (s === 0) {
        if (!form.patientFirstName.trim()) e.patientFirstName = 'Required';
        if (!form.patientLastName.trim()) e.patientLastName = 'Required';
        if (!form.patientDob) e.patientDob = 'Required';
      }
      if (s === 1) {
        if (!form.referringPhysician.trim()) e.referringPhysician = 'Required';
      }
      if (s === 2) {
        if (!form.primaryDiagnosis.trim()) e.primaryDiagnosis = 'Required';
        if (form.requestedServices.length === 0) e.requestedServices = 'Select at least one';
      }
      setErrors(e);
      return Object.keys(e).length === 0;
    },
    [form],
  );

  const next = useCallback(() => {
    if (validate(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }, [step, validate]);

  const back = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const submit = useCallback(async () => {
    try {
      setSubmitting(true);
      await referralPipelineGateway.create(form);
      toast.success(`Referral created for ${form.patientLastName}, ${form.patientFirstName}`);
      setForm({ ...EMPTY });
      setStep(0);
      setErrors({});
      onCreated();
      onOpenChange(false);
    } catch (err: any) {
      console.error('[NewReferralForm] Submit error:', err);
      toast.error(`Failed to create referral: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  }, [form, onCreated, onOpenChange]);

  const close = useCallback(
    (o: boolean) => {
      if (!o) { setForm({ ...EMPTY }); setStep(0); setErrors({}); }
      onOpenChange(o);
    },
    [onOpenChange],
  );

  // ─── Steps ────────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required error={errors.patientFirstName}>
                <Input value={form.patientFirstName} onChange={(e) => set('patientFirstName', e.target.value)} placeholder="Eleanor" className="text-sm" />
              </Field>
              <Field label="Last Name" required error={errors.patientLastName}>
                <Input value={form.patientLastName} onChange={(e) => set('patientLastName', e.target.value)} placeholder="Martinez" className="text-sm" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of Birth" required error={errors.patientDob}>
                <Input type="date" value={form.patientDob} onChange={(e) => set('patientDob', e.target.value)} className="text-sm" />
              </Field>
              <Field label="Phone">
                <Input value={form.patientPhone} onChange={(e) => set('patientPhone', e.target.value)} placeholder="(415) 555-0000" className="text-sm" />
              </Field>
            </div>
            <Field label="Address">
              <Input value={form.patientAddress} onChange={(e) => set('patientAddress', e.target.value)} placeholder="Street, City, State ZIP" className="text-sm" />
            </Field>
            <Field label="Urgency">
              <div className="flex gap-2">
                {(['routine', 'urgent', 'stat'] as ReferralUrgency[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => set('urgency', u)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-xs font-bold border transition-all flex-1',
                      form.urgency === u
                        ? u === 'stat'
                          ? 'bg-red-50 border-red-300 text-red-700 ring-1 ring-red-200'
                          : u === 'urgent'
                            ? 'bg-orange-50 border-orange-300 text-orange-700 ring-1 ring-orange-200'
                            : 'bg-gray-100 border-gray-300 text-gray-700 ring-1 ring-gray-300'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50',
                    )}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <Field label="Referral Source">
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(SOURCE_LABELS) as [ReferralSource, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => set('source', key)}
                    className={cn(
                      'px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all',
                      form.source === key
                        ? 'bg-blue-50 border-blue-300 text-blue-700 ring-1 ring-blue-200'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Source Details">
              <Input value={form.sourceDetails} onChange={(e) => set('sourceDetails', e.target.value)} placeholder="e.g. SF General — ICU Step-Down" className="text-sm" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Referring Physician" required error={errors.referringPhysician}>
                <Input value={form.referringPhysician} onChange={(e) => set('referringPhysician', e.target.value)} placeholder="Dr. Sarah Patel" className="text-sm" />
              </Field>
              <Field label="NPI">
                <Input value={form.referringPhysicianNpi} onChange={(e) => set('referringPhysicianNpi', e.target.value)} placeholder="1234567890" className="text-sm" />
              </Field>
            </div>
            <Field label="Assigned Office">
              <select
                value={form.assignedOffice}
                onChange={(e) => set('assignedOffice', e.target.value)}
                className="w-full h-9 text-sm border border-gray-200 rounded-md px-3 bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
              >
                <option value="Main Office">Main Office</option>
                <option value="South Office">South Office</option>
                <option value="North Office">North Office</option>
                <option value="East Office">East Office</option>
              </select>
            </Field>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary Diagnosis" required error={errors.primaryDiagnosis}>
                <Input value={form.primaryDiagnosis} onChange={(e) => set('primaryDiagnosis', e.target.value)} placeholder="Acute respiratory failure" className="text-sm" />
              </Field>
              <Field label="ICD-10 Code">
                <Input value={form.primaryDiagnosisIcd} onChange={(e) => set('primaryDiagnosisIcd', e.target.value)} placeholder="J96.00" className="text-sm" />
              </Field>
            </div>
            <Field label="Secondary Diagnoses">
              <div className="flex gap-2 mb-2">
                <Input
                  value={secDxInput}
                  onChange={(e) => setSecDxInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSecDx(); } }}
                  placeholder="Type and press Enter"
                  className="text-sm"
                />
                <Button type="button" variant="outline" size="sm" className="px-3" onClick={addSecDx}>
                  <Plus className="size-4" />
                </Button>
              </div>
              {form.secondaryDiagnoses.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.secondaryDiagnoses.map((dx, i) => (
                    <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1">
                      {dx}
                      <button onClick={() => removeSecDx(i)} className="hover:text-red-500 rounded-full">
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </Field>
            <Field label="Requested Services" required error={errors.requestedServices}>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(SERVICE_LABELS) as [ServiceType, string][]).map(([key, label]) => {
                  const selected = form.requestedServices.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleService(key)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all',
                        selected
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-1 ring-indigo-200'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50',
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                          selected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300',
                        )}
                      >
                        {selected && <CheckCircle2 className="size-3 text-white" />}
                      </div>
                      {label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Clinical Notes">
              <Textarea
                value={form.clinicalNotes}
                onChange={(e) => set('clinicalNotes', e.target.value)}
                placeholder="Relevant clinical details, precautions, equipment needs..."
                className="text-sm min-h-[80px] resize-none"
              />
            </Field>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Insurance Plan">
                <Input value={form.insurancePlan} onChange={(e) => set('insurancePlan', e.target.value)} placeholder="Medicare, Aetna, BCBS" className="text-sm" />
              </Field>
              <Field label="Member / Policy ID">
                <Input value={form.insuranceId} onChange={(e) => set('insuranceId', e.target.value)} placeholder="MCA-991233" className="text-sm" />
              </Field>
            </div>
            <Field label="Preferred Start of Care">
              <Input type="date" value={form.preferredStartDate} onChange={(e) => set('preferredStartDate', e.target.value)} className="text-sm" />
            </Field>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Insurance verification and authorization will begin automatically
                when this referral advances to the Insurance Verification stage.
              </p>
            </div>
          </div>
        );

      case 4: {
        const urgLabel = form.urgency === 'stat' ? 'STAT' : form.urgency === 'urgent' ? 'Urgent' : 'Routine';
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Patient</h4>
              <p className="text-base font-semibold text-gray-900">
                {form.patientLastName}, {form.patientFirstName}
              </p>
              <p className="text-sm text-gray-600">
                DOB: {form.patientDob} &middot; Phone: {form.patientPhone || 'N/A'} &middot;{' '}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px] h-5 px-1.5 rounded-full',
                    form.urgency === 'stat' ? 'bg-red-100 border-red-300 text-red-700' :
                    form.urgency === 'urgent' ? 'bg-orange-100 border-orange-300 text-orange-700' :
                    'bg-gray-100 border-gray-300 text-gray-600',
                  )}
                >
                  {urgLabel}
                </Badge>
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Source</h4>
              <p className="text-sm text-gray-800">
                {SOURCE_LABELS[form.source]} — {form.sourceDetails || 'No details'}
              </p>
              <p className="text-sm text-gray-600">
                Physician: {form.referringPhysician}
                {form.referringPhysicianNpi && ` (NPI: ${form.referringPhysicianNpi})`}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Clinical</h4>
              <p className="text-sm text-gray-800">
                {form.primaryDiagnosis} {form.primaryDiagnosisIcd && `(${form.primaryDiagnosisIcd})`}
              </p>
              {form.secondaryDiagnoses.length > 0 && (
                <p className="text-xs text-gray-500">+ {form.secondaryDiagnoses.join(', ')}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1">
                {form.requestedServices.map((svc) => (
                  <Badge key={svc} variant="secondary" className="text-xs">
                    {SERVICE_LABELS[svc]}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase">Insurance</h4>
              <p className="text-sm text-gray-800">
                {form.insurancePlan || 'Not specified'} {form.insuranceId && `(${form.insuranceId})`}
              </p>
              {form.preferredStartDate && (
                <p className="text-sm text-gray-600">Preferred SOC: {form.preferredStartDate}</p>
              )}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Plus className="size-5 text-blue-600" />
            New Referral
          </DialogTitle>
        </DialogHeader>

        <StepProgressBar currentStep={step} onStepClick={setStep} />

        <ScrollArea className="flex-1 px-6">
          <div className="py-5">{renderStep()}</div>
        </ScrollArea>

        <DialogFooter className="px-6 py-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-gray-400">
              Step {step + 1} of {STEPS.length}
            </span>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={back} className="gap-1.5">
                  <ChevronLeft className="size-3.5" />
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button size="sm" onClick={next} className="gap-1.5">
                  Next
                  <ChevronRight className="size-3.5" />
                </Button>
              ) : (
                <Button size="sm" onClick={submit} disabled={submitting} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                  Submit Referral
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default NewReferralForm;
