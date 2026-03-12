/**
 * New Admission Page
 * Multi-section admission form with:
 *  - Patient search & selection (or create inline)
 *  - Admission details, payer, physician, diagnosis
 *  - Autosave draft (via useFormAutosave)
 *  - Navigation guard ("save before navigate")
 *  - Posts to backend POST /admissions
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useFormAutosave } from '../hooks/useFormAutosave';
import { useNavigationGuard } from '../hooks/useNavigationGuard';
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
  Save,
  Loader2,
  Clock,
  Search,
  UserPlus,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase, publicAnonKey, API_BASE } from '../lib/supabaseClient';

interface PatientResult {
  id: string;
  first_name: string;
  last_name: string;
  mrn: string;
  dob: string;
  phone: string;
  address: string;
}

interface FormData {
  // Patient selection
  patient_id: string;
  // Admission
  admission_date: string;
  soc_date: string;
  type: string;
  status: string;
  referral_source: string;
  referral_date: string;
  // Payer
  payer: string;
  payer_id: string;
  authorization_number: string;
  cert_period_start: string;
  cert_period_end: string;
  // Physician
  physician_name: string;
  physician_npi: string;
  physician_phone: string;
  // Diagnosis
  diagnosis_primary: string;
  diagnosis_secondary: string;
  // Clinical
  allergies: string;
  medications: string;
  functional_limitations: string;
  goals: string;
  // Notes
  notes: string;
}

const EMPTY_FORM: FormData = {
  patient_id: '',
  admission_date: new Date().toISOString().split('T')[0],
  soc_date: '',
  type: 'Home Health',
  status: 'pending',
  referral_source: '',
  referral_date: new Date().toISOString().split('T')[0],
  payer: '',
  payer_id: '',
  authorization_number: '',
  cert_period_start: '',
  cert_period_end: '',
  physician_name: '',
  physician_npi: '',
  physician_phone: '',
  diagnosis_primary: '',
  diagnosis_secondary: '',
  allergies: '',
  medications: '',
  functional_limitations: '',
  goals: '',
  notes: '',
};

async function getHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token || publicAnonKey;
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// ─── Section collapse helper ───
function Section({
  title,
  description,
  icon: Icon,
  defaultOpen = true,
  children,
  badge,
}: {
  title: string;
  description?: string;
  icon: any;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="mb-4">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="size-5 text-blue-600" />
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && <CardDescription className="text-xs">{description}</CardDescription>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {open ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
          </div>
        </div>
      </CardHeader>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

// ─── Main Component ───
export default function NewAdmission() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  // Patient search
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<PatientResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Load draft from localStorage on mount ──
  useEffect(() => {
    const draft = localStorage.getItem('admission_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(parsed.formData || EMPTY_FORM);
        if (parsed.selectedPatient) setSelectedPatient(parsed.selectedPatient);
        toast.info('Draft restored. Continue where you left off.');
      } catch {
        /* ignore corrupt draft */
      }
    }
  }, []);

  // ── Autosave draft handler ──
  const handleAutosave = useCallback(
    async (data: FormData, isDraft: boolean) => {
      if (isDraft) {
        // Save to localStorage as draft
        localStorage.setItem(
          'admission_draft',
          JSON.stringify({ formData: data, selectedPatient, savedAt: new Date().toISOString() })
        );
      }
    },
    [selectedPatient]
  );

  const { isDirty, isSaving, lastSaved, saveNow, markClean } = useFormAutosave({
    formData,
    onSave: handleAutosave,
    enabled: true,
    autosaveInterval: 15000, // autosave draft every 15s
  });

  // Navigation guard
  useNavigationGuard({
    when: isDirty && !isSaving && !createdId,
    onConfirm: async () => {
      await saveNow(true);
    },
    message: 'You have unsaved changes. Save draft before leaving?',
  });

  // ── Patient search ──
  useEffect(() => {
    if (patientSearch.trim().length < 2) {
      setPatientResults([]);
      setShowResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const headers = await getHeaders();
        const res = await fetch(`${API_BASE}/patients?search=${encodeURIComponent(patientSearch)}`, { headers });
        if (res.ok) {
          const json = await res.json();
          setPatientResults(json.patients || []);
          setShowResults(true);
        }
      } catch (err) {
        console.error('[NewAdmission] patient search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectPatient = useCallback((p: PatientResult) => {
    setSelectedPatient(p);
    setFormData((prev) => ({ ...prev, patient_id: p.id }));
    setPatientSearch('');
    setShowResults(false);
    toast.success(`Selected patient: ${p.first_name} ${p.last_name}`);
  }, []);

  // ── Field change ──
  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Full submit ──
  const handleSubmit = useCallback(async () => {
    // Validation
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }
    if (!formData.admission_date) {
      toast.error('Admission date is required');
      return;
    }
    if (!formData.type) {
      toast.error('Admission type is required');
      return;
    }

    setSubmitting(true);
    try {
      const headers = await getHeaders();
      const payload = {
        patientId: formData.patient_id,
        officeId: profile?.office_id || 'office-main',
        admissionDate: formData.admission_date,
        soc_date: formData.soc_date || null,
        type: formData.type,
        status: formData.status || 'pending',
        payer: formData.payer,
        payer_id: formData.payer_id,
        authorization_number: formData.authorization_number,
        cert_period_start: formData.cert_period_start || null,
        cert_period_end: formData.cert_period_end || null,
        physician_name: formData.physician_name,
        physician_npi: formData.physician_npi,
        physician_phone: formData.physician_phone,
        diagnosis_primary: formData.diagnosis_primary,
        diagnosis_secondary: formData.diagnosis_secondary,
        referral_source: formData.referral_source,
        referral_date: formData.referral_date || null,
        allergies: formData.allergies,
        medications: formData.medications,
        functional_limitations: formData.functional_limitations,
        goals: formData.goals,
        notes: formData.notes,
      };

      const res = await fetch(`${API_BASE}/admissions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const json = await res.json();
      const newId = json.admission?.id;

      // Clear draft
      localStorage.removeItem('admission_draft');
      markClean();
      setCreatedId(newId);

      toast.success('Admission created successfully');
      navigate(`/admissions/${newId || ''}`);
    } catch (err: any) {
      console.error('[NewAdmission] submit error:', err);
      toast.error(`Failed to create admission: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [formData, profile, navigate, markClean]);

  // ── Computed completeness ──
  const completeness = useMemo(() => {
    const fields: (keyof FormData)[] = [
      'patient_id',
      'admission_date',
      'type',
      'payer',
      'physician_name',
      'diagnosis_primary',
      'referral_source',
    ];
    const filled = fields.filter((f) => !!formData[f]).length;
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  return (
    <div className="size-full bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admissions')}>
                <ArrowLeft className="size-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ClipboardCheck className="size-6 text-blue-600" />
                  New Admission
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Create a new patient admission with autosave draft support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="size-3" />
                  Draft saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
              {isDirty && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                  Unsaved
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => saveNow(true)} disabled={isSaving}>
                {isSaving ? <Loader2 className="size-4 animate-spin mr-1" /> : <Save className="size-4 mr-1" />}
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !formData.patient_id}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    Create Admission
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Form Completeness</span>
              <span>{completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  completeness === 100
                    ? 'bg-green-500'
                    : completeness >= 60
                    ? 'bg-blue-500'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>

        {/* ─── Section 1: Patient Selection ─── */}
        <Section
          title="Patient"
          description="Search and select an existing patient"
          icon={UserPlus}
          badge={
            selectedPatient ? (
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                <CheckCircle2 className="size-3 mr-1" />
                Selected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                <AlertCircle className="size-3 mr-1" />
                Required
              </Badge>
            )
          }
        >
          {selectedPatient ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 space-x-4">
                    <span>MRN: <span className="font-mono">{selectedPatient.mrn}</span></span>
                    <span>DOB: {selectedPatient.dob}</span>
                    {selectedPatient.phone && <span>Phone: {selectedPatient.phone}</span>}
                  </div>
                  {selectedPatient.address && (
                    <div className="text-xs text-gray-500 mt-1">{selectedPatient.address}</div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(null);
                    handleChange('patient_id', '');
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name, MRN, or phone..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-gray-400" />
                )}
              </div>
              {showResults && patientResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {patientResults.map((p) => (
                    <button
                      key={p.id}
                      className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b last:border-0"
                      onClick={() => selectPatient(p)}
                    >
                      <div className="font-medium text-gray-900">
                        {p.first_name} {p.last_name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        MRN: {p.mrn} · DOB: {p.dob} {p.phone ? `· ${p.phone}` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showResults && patientResults.length === 0 && patientSearch.length >= 2 && !searchLoading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                  No patients found matching "{patientSearch}"
                </div>
              )}
            </div>
          )}
        </Section>

        {/* ─── Section 2: Admission Details ─── */}
        <Section title="Admission Details" icon={ClipboardCheck}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Admission Date *</Label>
              <Input
                type="date"
                value={formData.admission_date}
                onChange={(e) => handleChange('admission_date', e.target.value)}
              />
            </div>
            <div>
              <Label>Start of Care Date</Label>
              <Input
                type="date"
                value={formData.soc_date}
                onChange={(e) => handleChange('soc_date', e.target.value)}
              />
            </div>
            <div>
              <Label>Admission Type *</Label>
              <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home Health">Home Health</SelectItem>
                  <SelectItem value="Hospice">Hospice</SelectItem>
                  <SelectItem value="Private Duty">Private Duty</SelectItem>
                  <SelectItem value="Palliative Care">Palliative Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Referral Source</Label>
              <Input
                value={formData.referral_source}
                onChange={(e) => handleChange('referral_source', e.target.value)}
                placeholder="e.g., Hospital Discharge, Physician Office"
              />
            </div>
            <div>
              <Label>Referral Date</Label>
              <Input
                type="date"
                value={formData.referral_date}
                onChange={(e) => handleChange('referral_date', e.target.value)}
              />
            </div>
          </div>
        </Section>

        {/* ─── Section 3: Payer / Insurance ─── */}
        <Section title="Payer / Insurance" icon={FileText} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Payer *</Label>
              <Select value={formData.payer} onValueChange={(v) => handleChange('payer', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicare">Medicare</SelectItem>
                  <SelectItem value="Medicaid">Medicaid</SelectItem>
                  <SelectItem value="Blue Cross">Blue Cross Blue Shield</SelectItem>
                  <SelectItem value="Aetna">Aetna</SelectItem>
                  <SelectItem value="UnitedHealthcare">UnitedHealthcare</SelectItem>
                  <SelectItem value="Humana">Humana</SelectItem>
                  <SelectItem value="Cigna">Cigna</SelectItem>
                  <SelectItem value="Private Pay">Private Pay</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payer ID / Member ID</Label>
              <Input
                value={formData.payer_id}
                onChange={(e) => handleChange('payer_id', e.target.value)}
                placeholder="e.g., 1234567890A"
              />
            </div>
            <div>
              <Label>Authorization Number</Label>
              <Input
                value={formData.authorization_number}
                onChange={(e) => handleChange('authorization_number', e.target.value)}
                placeholder="e.g., AUTH-2026-001"
              />
            </div>
            <div />
            <div>
              <Label>Cert Period Start</Label>
              <Input
                type="date"
                value={formData.cert_period_start}
                onChange={(e) => handleChange('cert_period_start', e.target.value)}
              />
            </div>
            <div>
              <Label>Cert Period End</Label>
              <Input
                type="date"
                value={formData.cert_period_end}
                onChange={(e) => handleChange('cert_period_end', e.target.value)}
              />
            </div>
          </div>
        </Section>

        {/* ─── Section 4: Attending Physician ─── */}
        <Section title="Attending Physician" icon={UserPlus} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Physician Name *</Label>
              <Input
                value={formData.physician_name}
                onChange={(e) => handleChange('physician_name', e.target.value)}
                placeholder="e.g., Dr. Andrew Chen"
              />
            </div>
            <div>
              <Label>NPI</Label>
              <Input
                value={formData.physician_npi}
                onChange={(e) => handleChange('physician_npi', e.target.value)}
                placeholder="10-digit NPI"
                maxLength={10}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={formData.physician_phone}
                onChange={(e) => handleChange('physician_phone', e.target.value)}
                placeholder="(555) 555-5555"
              />
            </div>
          </div>
        </Section>

        {/* ─── Section 5: Diagnosis ─── */}
        <Section title="Diagnosis & Clinical" icon={FileText} defaultOpen={false}>
          <div className="space-y-4">
            <div>
              <Label>Primary Diagnosis (ICD-10) *</Label>
              <Input
                value={formData.diagnosis_primary}
                onChange={(e) => handleChange('diagnosis_primary', e.target.value)}
                placeholder="e.g., M54.5 Low back pain"
              />
            </div>
            <div>
              <Label>Secondary Diagnoses</Label>
              <Textarea
                value={formData.diagnosis_secondary}
                onChange={(e) => handleChange('diagnosis_secondary', e.target.value)}
                placeholder="One per line, e.g., I10 Essential hypertension"
                rows={3}
              />
            </div>
            <div>
              <Label>Allergies</Label>
              <Textarea
                value={formData.allergies}
                onChange={(e) => handleChange('allergies', e.target.value)}
                placeholder="List known allergies..."
                rows={2}
              />
            </div>
            <div>
              <Label>Current Medications</Label>
              <Textarea
                value={formData.medications}
                onChange={(e) => handleChange('medications', e.target.value)}
                placeholder="List current medications..."
                rows={3}
              />
            </div>
            <div>
              <Label>Functional Limitations</Label>
              <Textarea
                value={formData.functional_limitations}
                onChange={(e) => handleChange('functional_limitations', e.target.value)}
                placeholder="Describe functional limitations..."
                rows={2}
              />
            </div>
            <div>
              <Label>Goals</Label>
              <Textarea
                value={formData.goals}
                onChange={(e) => handleChange('goals', e.target.value)}
                placeholder="Treatment goals for this admission..."
                rows={3}
              />
            </div>
          </div>
        </Section>

        {/* ─── Section 6: Notes ─── */}
        <Section title="Additional Notes" icon={FileText} defaultOpen={false}>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any additional notes for this admission..."
            rows={4}
          />
        </Section>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between py-4 border-t mt-2">
          <Button variant="outline" onClick={() => navigate('/admissions')}>
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => saveNow(true)} disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin mr-1" /> : <Save className="size-4 mr-1" />}
              Save as Draft
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !formData.patient_id}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Create Admission
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
