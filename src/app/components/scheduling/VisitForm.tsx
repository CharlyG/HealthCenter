/**
 * Visit Form - Create/Edit Visit
 * Fields: patient, admission, date, start time, end time, caregiver, billing code
 * Connected to patientGateway, admissionGateway, caregiverGateway, visitGateway — no inline mock data.
 */
import { useState, useEffect, useCallback } from 'react';
import { Save, X, Clock, Calendar as CalendarIcon, User, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FormSection, FormFieldGroup } from '../design-system/FormSection';
import { Badge } from '../ui/badge';
import {
  patientGateway,
  admissionGateway,
  caregiverGateway,
  visitGateway,
  type Patient,
  type Admission,
  type Caregiver,
} from '../../lib/dataGateway';

interface VisitFormProps {
  visitId?: string;
  initialData?: any;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

interface VisitFormData {
  patient_id: string;
  admission_id: string;
  visit_date: string;
  start_time: string;
  end_time: string;
  caregiver_id: string;
  billing_code: string;
  notes: string;
}

interface ConflictWarning {
  type: 'schedule' | 'travel' | 'availability';
  message: string;
  severity: 'warning' | 'error';
}

const BILLING_CODES = [
  { code: 'G0154', description: 'Skilled nursing visit (RN)' },
  { code: 'G0151', description: 'Physical therapy visit' },
  { code: 'G0152', description: 'Occupational therapy visit' },
  { code: 'G0153', description: 'Speech therapy visit' },
  { code: 'G0155', description: 'Social worker visit' },
  { code: 'G0156', description: 'Home health aide visit' },
];

export default function VisitForm({ visitId, initialData, onSave, onCancel }: VisitFormProps) {
  const navigate = useNavigate();
  const isEdit = !!visitId;

  const [formData, setFormData] = useState<VisitFormData>({
    patient_id: initialData?.patient_id || '',
    admission_id: initialData?.admission_id || '',
    visit_date: initialData?.visit_date || '',
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    caregiver_id: initialData?.caregiver_id || '',
    billing_code: initialData?.billing_code || '',
    notes: initialData?.notes || '',
  });

  const [conflicts, setConflicts] = useState<ConflictWarning[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Server-fetched dropdown data
  const [patients, setPatients] = useState<Patient[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Load patients and caregivers on mount
  useEffect(() => {
    (async () => {
      setLoadingDropdowns(true);
      try {
        const [patientRes, caregiverRes] = await Promise.all([
          patientGateway.search({ pagination: { page: 1, pageSize: 200 } }),
          caregiverGateway.list(),
        ]);
        setPatients(patientRes.data);
        setCaregivers(caregiverRes);
      } catch (err) {
        console.error('[VisitForm] Error loading dropdowns:', err);
        toast.error('Failed to load form data');
      } finally {
        setLoadingDropdowns(false);
      }
    })();
  }, []);

  // Load admissions when patient changes
  useEffect(() => {
    if (!formData.patient_id) {
      setAdmissions([]);
      return;
    }
    (async () => {
      try {
        const admRes = await admissionGateway.getByPatientId(formData.patient_id);
        setAdmissions(admRes);
      } catch (err) {
        console.error('[VisitForm] Error loading admissions for patient:', err);
      }
    })();
  }, [formData.patient_id]);

  // Conflict checking is now handled server-side when we POST/PATCH the visit.
  // We clear local warnings when key fields change.
  useEffect(() => {
    setConflicts([]);
    setTravelTime(null);
  }, [formData.caregiver_id, formData.visit_date, formData.start_time, formData.end_time]);

  const handleFieldChange = (field: keyof VisitFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.patient_id || !formData.admission_id || !formData.visit_date ||
        !formData.start_time || !formData.end_time || !formData.billing_code) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        patientId: formData.patient_id,
        admissionId: formData.admission_id,
        scheduledDate: formData.visit_date,
        scheduledTime: formData.start_time,
        visitType: 'Skilled',
        discipline: 'RN',
        clinicianId: formData.caregiver_id || undefined,
        status: formData.caregiver_id ? 'scheduled' as const : 'open' as const,
        notes: formData.notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEdit && visitId) {
        await visitGateway.update(visitId, payload);
      } else {
        await visitGateway.create(payload);
      }

      if (onSave) {
        onSave(formData);
      } else {
        toast.success(isEdit ? 'Visit updated successfully' : 'Visit created successfully');
        navigate('/scheduling');
      }
    } catch (error: any) {
      // Server returns 409 for scheduling conflicts
      if (error.message?.includes('409') || error.message?.includes('conflict')) {
        setConflicts([{
          type: 'schedule',
          message: 'Scheduling conflict detected. The caregiver already has an overlapping visit.',
          severity: 'error',
        }]);
        toast.error('Scheduling conflict detected — see warning below');
      } else {
        toast.error('Failed to save visit');
      }
      console.error('[VisitForm] save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostAsOpenShift = async () => {
    if (!formData.patient_id || !formData.admission_id || !formData.visit_date ||
        !formData.start_time || !formData.end_time || !formData.billing_code) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      await visitGateway.create({
        patientId: formData.patient_id,
        admissionId: formData.admission_id,
        scheduledDate: formData.visit_date,
        scheduledTime: formData.start_time,
        visitType: 'Skilled',
        discipline: 'RN',
        status: 'open',
        notes: formData.notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success('Posted as open shift — caregivers will be notified');
      navigate('/scheduling/open-shifts');
    } catch (error) {
      toast.error('Failed to post open shift');
      console.error('[VisitForm] open shift error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingDropdowns) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="size-6 animate-spin text-blue-500 mr-2" />
            <span className="text-gray-500">Loading form data…</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isEdit ? 'Edit Visit' : 'Create New Visit'}</CardTitle>
            <Button variant="ghost" onClick={onCancel || (() => navigate('/scheduling'))}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FormSection>
            {/* Patient and Admission */}
            <FormFieldGroup columns={2}>
              <div>
                <Label htmlFor="patient_id">
                  Patient *
                  <User className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Select
                  value={formData.patient_id}
                  onValueChange={(value) => {
                    handleFieldChange('patient_id', value);
                    handleFieldChange('admission_id', ''); // reset admission when patient changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.lastName}, {patient.firstName} ({patient.mrn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="admission_id">
                  Admission *
                </Label>
                <Select
                  value={formData.admission_id}
                  onValueChange={(value) => handleFieldChange('admission_id', value)}
                  disabled={!formData.patient_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select admission" />
                  </SelectTrigger>
                  <SelectContent>
                    {admissions.map(admission => (
                      <SelectItem key={admission.id} value={admission.id}>
                        {admission.admissionDate} — {admission.primaryDiagnosis || admission.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormFieldGroup>

            {/* Date and Time */}
            <FormFieldGroup columns={3}>
              <div>
                <Label htmlFor="visit_date">
                  Visit Date *
                  <CalendarIcon className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Input
                  id="visit_date"
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => handleFieldChange('visit_date', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="start_time">
                  Start Time *
                  <Clock className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleFieldChange('start_time', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_time">
                  End Time *
                  <Clock className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleFieldChange('end_time', e.target.value)}
                  required
                />
              </div>
            </FormFieldGroup>

            {/* Caregiver and Billing Code */}
            <FormFieldGroup columns={2}>
              <div>
                <Label htmlFor="caregiver_id">
                  Caregiver
                  <User className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Select
                  value={formData.caregiver_id}
                  onValueChange={(value) => handleFieldChange('caregiver_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select caregiver (or leave blank for open shift)" />
                  </SelectTrigger>
                  <SelectContent>
                    {caregivers.map(caregiver => (
                      <SelectItem key={caregiver.id} value={caregiver.id}>
                        {caregiver.name}
                        {caregiver.status !== 'active' && ` (${caregiver.status})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.caregiver_id && (
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to post as open shift
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="billing_code">
                  Billing Code *
                  <DollarSign className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Select
                  value={formData.billing_code}
                  onValueChange={(value) => handleFieldChange('billing_code', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing code" />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_CODES.map(code => (
                      <SelectItem key={code.code} value={code.code}>
                        {code.code} - {code.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormFieldGroup>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="w-full min-h-[80px] p-2 border rounded-md"
                placeholder="Add any special instructions or notes"
              />
            </div>
          </FormSection>

          {/* Conflicts and Warnings */}
          {isChecking && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">Checking availability and conflicts...</p>
            </div>
          )}

          {!isChecking && conflicts.length > 0 && (
            <div className="mt-6 space-y-2">
              {conflicts.map((conflict, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg flex items-start gap-3 ${
                    conflict.severity === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <AlertTriangle
                    className={`size-5 mt-0.5 ${
                      conflict.severity === 'error' ? 'text-red-600' : 'text-yellow-600'
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        conflict.severity === 'error' ? 'text-red-900' : 'text-yellow-900'
                      }`}
                    >
                      {conflict.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Travel Time Display */}
          {travelTime !== null && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Estimated Travel Time</p>
                  <p className="text-xs text-blue-700">From previous visit</p>
                </div>
                <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                  {travelTime} min
                </Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={onCancel || (() => navigate('/scheduling'))}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              {!formData.caregiver_id && (
                <Button variant="outline" onClick={handlePostAsOpenShift} disabled={isSaving}>
                  Post as Open Shift
                </Button>
              )}
              <Button onClick={handleSave} disabled={conflicts.some(c => c.severity === 'error') || isSaving}>
                {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                {isEdit ? 'Update Visit' : 'Create Visit'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
