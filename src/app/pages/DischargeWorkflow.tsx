/**
 * Discharge Workflow Page
 * Multi-step discharge process with:
 *  - Admission summary review
 *  - Discharge reason & date
 *  - Discharge summary generation (auto-generated from visit history)
 *  - Medication reconciliation
 *  - Follow-up instructions
 *  - Final confirmation
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  UserMinus,
  FileText,
  AlertTriangle,
  Calendar,
  ClipboardList,
  Pill,
  Stethoscope,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, publicAnonKey, API_BASE } from '../lib/supabaseClient';

async function getHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token || publicAnonKey;
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

interface Admission {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn: string;
  patient_dob: string;
  admission_date: string;
  soc_date: string | null;
  type: string;
  payer: string;
  physician_name: string;
  diagnosis_primary: string;
  status: string;
  cert_period_start: string | null;
  cert_period_end: string | null;
}

const DISCHARGE_REASONS = [
  { value: 'Goals Met', label: 'Goals Met – Patient met all care plan goals' },
  { value: 'Patient Declined', label: 'Patient Declined – Patient chose to discontinue' },
  { value: 'Physician Order', label: 'Physician Order – Per attending physician directive' },
  { value: 'Transfer', label: 'Transfer – Transferred to another facility / provider' },
  { value: 'Hospitalized', label: 'Hospitalized – Patient admitted to hospital' },
  { value: 'Moved Out of Area', label: 'Moved Out of Area – Patient relocated' },
  { value: 'Non-Compliant', label: 'Non-Compliant – Persistent non-compliance' },
  { value: 'Revocation', label: 'Revocation – Hospice benefit revocation' },
  { value: 'Expired', label: 'Expired – Patient deceased' },
  { value: 'Other', label: 'Other' },
];

const STEPS = [
  { id: 1, label: 'Review', icon: ClipboardList },
  { id: 2, label: 'Reason', icon: FileText },
  { id: 3, label: 'Summary', icon: Stethoscope },
  { id: 4, label: 'Medications', icon: Pill },
  { id: 5, label: 'Confirm', icon: CheckCircle2 },
];

export default function DischargeWorkflow() {
  const navigate = useNavigate();
  const { admissionId } = useParams();
  const { profile } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [admission, setAdmission] = useState<Admission | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Discharge form state
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);
  const [dischargeReason, setDischargeReason] = useState('');
  const [dischargeReasonDetail, setDischargeReasonDetail] = useState('');
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [medicationChanges, setMedicationChanges] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [followUpPhysician, setFollowUpPhysician] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [patientEducation, setPatientEducation] = useState('');
  const [dmeReturned, setDmeReturned] = useState('');

  // Load admission
  useEffect(() => {
    const load = async () => {
      if (!admissionId) return;
      setLoading(true);
      try {
        const headers = await getHeaders();
        const res = await fetch(`${API_BASE}/admissions/${admissionId}`, { headers });
        if (!res.ok) throw new Error(`Failed to load admission: ${res.status}`);
        const json = await res.json();
        setAdmission(json.admission || null);
        // Pre-fill follow-up physician
        if (json.admission?.physician_name) {
          setFollowUpPhysician(json.admission.physician_name);
        }
      } catch (err: any) {
        console.error('[DischargeWorkflow] load error:', err);
        toast.error('Failed to load admission');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [admissionId]);

  // Generate discharge summary from visit history
  const generateSummary = useCallback(async () => {
    if (!admission) return;
    setGeneratingSummary(true);
    try {
      // Fetch visit notes for this patient
      const headers = await getHeaders();
      const [notesRes, visitsRes] = await Promise.all([
        fetch(`${API_BASE}/clinical/visit-notes`, { headers }).catch(() => null),
        fetch(`${API_BASE}/visits?patient_id=${admission.patient_id}`, { headers }).catch(() => null),
      ]);

      let noteCount = 0;
      let visitCount = 0;
      let completedVisits = 0;

      if (notesRes?.ok) {
        const notesJson = await notesRes.json();
        noteCount = (notesJson.visitNotes || []).length;
      }
      if (visitsRes?.ok) {
        const visitsJson = await visitsRes.json();
        const visits = visitsJson.data || [];
        visitCount = visits.length;
        completedVisits = visits.filter((v: any) => v.status === 'completed').length;
      }

      const admDate = new Date(admission.admission_date);
      const discDate = new Date(dischargeDate);
      const daysDiff = Math.ceil((discDate.getTime() - admDate.getTime()) / (1000 * 60 * 60 * 24));

      const summary = [
        `DISCHARGE SUMMARY`,
        `${'='.repeat(50)}`,
        ``,
        `Patient: ${admission.patient_name}`,
        `MRN: ${admission.patient_mrn}`,
        `Admission Type: ${admission.type}`,
        `Primary Payer: ${admission.payer}`,
        `Attending Physician: ${admission.physician_name}`,
        ``,
        `DATES`,
        `  Admission Date: ${admission.admission_date}`,
        `  Start of Care: ${admission.soc_date || 'N/A'}`,
        `  Discharge Date: ${dischargeDate}`,
        `  Length of Stay: ${daysDiff} days`,
        admission.cert_period_start ? `  Cert Period: ${admission.cert_period_start} to ${admission.cert_period_end}` : '',
        ``,
        `PRIMARY DIAGNOSIS`,
        `  ${admission.diagnosis_primary}`,
        ``,
        `DISCHARGE REASON`,
        `  ${dischargeReason || '(Not yet specified)'}`,
        dischargeReasonDetail ? `  Detail: ${dischargeReasonDetail}` : '',
        ``,
        `SERVICE UTILIZATION`,
        `  Total Visits Scheduled: ${visitCount}`,
        `  Visits Completed: ${completedVisits}`,
        `  Clinical Notes: ${noteCount}`,
        ``,
        `CLINICAL SUMMARY`,
        `  Patient was admitted for ${admission.diagnosis_primary}.`,
        `  Over the course of ${daysDiff} days, ${completedVisits} visit(s) were completed.`,
        dischargeReason === 'Goals Met'
          ? `  All care plan goals were met and the patient demonstrated sufficient independence.`
          : dischargeReason === 'Expired'
          ? `  Patient expired during the course of care. Comfort measures were provided.`
          : `  The patient is being discharged at this time per the specified reason.`,
        ``,
        `FOLLOW-UP INSTRUCTIONS`,
        `  (To be completed in Step 4)`,
        ``,
        `This summary was auto-generated on ${new Date().toLocaleDateString()} and should be reviewed and amended by the discharging clinician.`,
      ].filter(Boolean).join('\n');

      setDischargeSummary(summary);
      toast.success('Discharge summary generated from visit history');
    } catch (err: any) {
      console.error('[DischargeWorkflow] summary gen error:', err);
      toast.error('Failed to generate summary');
    } finally {
      setGeneratingSummary(false);
    }
  }, [admission, dischargeDate, dischargeReason, dischargeReasonDetail]);

  // Submit discharge
  const handleSubmit = useCallback(async () => {
    if (!admission || !admissionId) return;
    if (!dischargeReason) {
      toast.error('Discharge reason is required');
      setStep(2);
      return;
    }
    setSubmitting(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_BASE}/admissions/${admissionId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: 'discharged',
          discharge_date: dischargeDate,
          discharge_reason: dischargeReason,
          discharge_reason_detail: dischargeReasonDetail,
          discharge_summary: dischargeSummary,
          discharge_medication_changes: medicationChanges,
          discharge_follow_up: followUpInstructions,
          discharge_follow_up_physician: followUpPhysician,
          discharge_follow_up_date: followUpDate || null,
          discharge_patient_education: patientEducation,
          discharge_dme_returned: dmeReturned,
          discharged_by: profile?.id || 'unknown',
          discharged_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      toast.success('Patient discharged successfully');
      navigate('/admissions');
    } catch (err: any) {
      console.error('[DischargeWorkflow] discharge error:', err);
      toast.error(`Failed to discharge: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [
    admission, admissionId, dischargeDate, dischargeReason, dischargeReasonDetail,
    dischargeSummary, medicationChanges, followUpInstructions, followUpPhysician,
    followUpDate, patientEducation, dmeReturned, profile, navigate,
  ]);

  const canAdvance = useMemo(() => {
    switch (step) {
      case 1: return !!admission;
      case 2: return !!dischargeReason && !!dischargeDate;
      case 3: return !!dischargeSummary;
      case 4: return true; // medications/follow-up optional
      case 5: return true;
      default: return false;
    }
  }, [step, admission, dischargeReason, dischargeDate, dischargeSummary]);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-12 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading admission...</p>
        </div>
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="size-12 mx-auto mb-4 text-amber-500" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admission Not Found</h2>
          <p className="text-gray-600 mb-4">The admission you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/admissions')}>Back to Admissions</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admissions')}>
              <ArrowLeft className="size-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserMinus className="size-6 text-red-600" />
                Discharge Workflow
              </h1>
              <p className="text-sm text-gray-500">
                {admission.patient_name} · {admission.type} · Admitted {admission.admission_date}
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1 bg-white rounded-lg border p-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone = step > s.id;
              return (
                <button
                  key={s.id}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => (isDone || isActive) && setStep(s.id)}
                >
                  {isDone ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Step 1: Review ─── */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Admission</CardTitle>
              <CardDescription>Confirm patient and admission details before proceeding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-xs text-gray-500">Patient</Label>
                  <p className="font-semibold text-gray-900">{admission.patient_name}</p>
                  <p className="text-sm text-gray-600">MRN: {admission.patient_mrn}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-xs text-gray-500">Admission Type</Label>
                  <p className="font-semibold text-gray-900">{admission.type}</p>
                  <p className="text-sm text-gray-600">Payer: {admission.payer}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-xs text-gray-500">Admission Date</Label>
                  <p className="font-semibold text-gray-900">{admission.admission_date}</p>
                  <p className="text-sm text-gray-600">SOC: {admission.soc_date || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-xs text-gray-500">Attending Physician</Label>
                  <p className="font-semibold text-gray-900">{admission.physician_name}</p>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-lg p-4">
                  <Label className="text-xs text-gray-500">Primary Diagnosis</Label>
                  <p className="font-semibold text-gray-900">{admission.diagnosis_primary}</p>
                </div>
                {admission.cert_period_start && (
                  <div className="col-span-2 bg-gray-50 rounded-lg p-4">
                    <Label className="text-xs text-gray-500">Certification Period</Label>
                    <p className="font-semibold text-gray-900">
                      {admission.cert_period_start} to {admission.cert_period_end}
                    </p>
                  </div>
                )}
              </div>
              {admission.status === 'discharged' && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="size-5 text-amber-600" />
                  <span className="text-sm text-amber-800">This admission is already discharged.</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─── Step 2: Discharge Reason ─── */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Discharge Reason</CardTitle>
              <CardDescription>Specify the reason and date for discharge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Discharge Date *</Label>
                <Input
                  type="date"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Discharge Reason *</Label>
                <Select value={dischargeReason} onValueChange={setDischargeReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discharge reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCHARGE_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Additional Details</Label>
                <Textarea
                  value={dischargeReasonDetail}
                  onChange={(e) => setDischargeReasonDetail(e.target.value)}
                  placeholder="Provide additional context for the discharge reason..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ─── Step 3: Discharge Summary ─── */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Discharge Summary</CardTitle>
                  <CardDescription>
                    Auto-generate from visit history or write manually
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={generateSummary}
                  disabled={generatingSummary}
                >
                  {generatingSummary ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="size-4 mr-2" />
                      Generate from Visit History
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={dischargeSummary}
                onChange={(e) => setDischargeSummary(e.target.value)}
                placeholder="Enter or generate the discharge summary..."
                rows={20}
                className="font-mono text-sm"
              />
              {!dischargeSummary && (
                <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  A discharge summary is required before finalizing
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─── Step 4: Medications & Follow-Up ─── */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="size-5 text-purple-600" />
                  Medication Reconciliation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={medicationChanges}
                  onChange={(e) => setMedicationChanges(e.target.value)}
                  placeholder="Document any medication changes at discharge: new medications, discontinued medications, dose changes..."
                  rows={5}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5 text-blue-600" />
                  Follow-Up Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Follow-Up Physician</Label>
                    <Input
                      value={followUpPhysician}
                      onChange={(e) => setFollowUpPhysician(e.target.value)}
                      placeholder="e.g., Dr. Andrew Chen"
                    />
                  </div>
                  <div>
                    <Label>Follow-Up Date</Label>
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Follow-Up Instructions</Label>
                  <Textarea
                    value={followUpInstructions}
                    onChange={(e) => setFollowUpInstructions(e.target.value)}
                    placeholder="Instructions for the patient after discharge..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Patient / Caregiver Education Provided</Label>
                  <Textarea
                    value={patientEducation}
                    onChange={(e) => setPatientEducation(e.target.value)}
                    placeholder="Document education provided to patient or caregiver..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>DME / Equipment Returned</Label>
                  <Input
                    value={dmeReturned}
                    onChange={(e) => setDmeReturned(e.target.value)}
                    placeholder="List any durable medical equipment returned"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Step 5: Confirm ─── */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="size-5" />
                Confirm Discharge
              </CardTitle>
              <CardDescription>
                Review all details below. This action will change the admission status to "Discharged".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Label className="text-xs text-gray-500">Patient</Label>
                    <p className="font-semibold">{admission.patient_name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Label className="text-xs text-gray-500">Discharge Date</Label>
                    <p className="font-semibold">{dischargeDate}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Label className="text-xs text-gray-500">Discharge Reason</Label>
                    <p className="font-semibold">{dischargeReason}</p>
                    {dischargeReasonDetail && (
                      <p className="text-xs text-gray-600 mt-1">{dischargeReasonDetail}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Label className="text-xs text-gray-500">Follow-Up</Label>
                    <p className="font-semibold">{followUpPhysician || 'Not specified'}</p>
                    {followUpDate && <p className="text-xs text-gray-600">{followUpDate}</p>}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <Label className="text-xs text-gray-500">Discharge Summary</Label>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto mt-1">
                    {dischargeSummary ? dischargeSummary.substring(0, 500) + (dischargeSummary.length > 500 ? '...' : '') : 'Not generated'}
                  </p>
                </div>

                {/* Checklist */}
                <div className="border rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Discharge Checklist</p>
                  {[
                    { label: 'Discharge reason specified', done: !!dischargeReason },
                    { label: 'Discharge summary completed', done: !!dischargeSummary },
                    { label: 'Medication reconciliation', done: !!medicationChanges },
                    { label: 'Follow-up instructions provided', done: !!followUpInstructions },
                    { label: 'Patient education documented', done: !!patientEducation },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {item.done ? (
                        <CheckCircle2 className="size-4 text-green-600" />
                      ) : (
                        <div className="size-4 rounded-full border-2 border-gray-300" />
                      )}
                      <span className={`text-sm ${item.done ? 'text-gray-900' : 'text-gray-500'}`}>
                        {item.label}
                      </span>
                      {!item.done && (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 ml-auto">
                          Optional
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium">
                    By clicking "Discharge Patient", you confirm that all required documentation has been
                    completed and the patient has been informed of their discharge.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between py-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate('/admissions'))}
          >
            <ArrowLeft className="size-4 mr-1" />
            {step > 1 ? 'Previous' : 'Cancel'}
          </Button>
          <div className="flex items-center gap-3">
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance}>
                Next
                <ArrowRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleSubmit}
                disabled={submitting || !dischargeReason}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Discharging...
                  </>
                ) : (
                  <>
                    <UserMinus className="size-4 mr-2" />
                    Discharge Patient
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
