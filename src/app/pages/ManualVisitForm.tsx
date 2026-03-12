/**
 * Manual Visit Creation
 * Create unscheduled visits with optional recurrence pattern
 * Integrates Admission Readiness checks to prevent scheduling for non-ready admissions
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Save, X, Calendar as CalendarIcon, Clock, Repeat, User, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import * as dataGateway from '../lib/dataGateway';
import { PageLayout, PageHeader } from '../components/design-system/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { FormSection, FormFieldGroup } from '../components/design-system/FormSection';
import { 
  calculateReadiness, 
  generateMockChecklist, 
  type AdmissionReadiness,
  type ChecklistItem,
} from '../components/admission/AdmissionReadiness';
import {
  ReadinessWarningAlert,
  ReadinessSummaryBadge,
  InlineReadinessCheck,
} from '../components/admission/AdmissionReadinessWarning';

interface RecurrencePattern {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  interval: number;
  daysOfWeek: number[]; // 0-6 for Sunday-Saturday
  endType: 'date' | 'occurrences';
  endDate?: string;
  occurrences?: number;
}

export default function ManualVisitForm() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [admissionReadiness, setAdmissionReadiness] = useState<AdmissionReadiness | null>(null);
  const [overrideWarning, setOverrideWarning] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: '',
    admission_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '09:00',
    visit_type: 'Skilled Nursing',
    discipline: 'RN',
    notes: '',
  });

  const [recurrence, setRecurrence] = useState<RecurrencePattern>({
    enabled: false,
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [],
    endType: 'occurrences',
    occurrences: 4,
  });

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (formData.patient_id) {
      loadAdmissions(formData.patient_id);
    } else {
      setAdmissions([]);
      setSelectedAdmission(null);
      setAdmissionReadiness(null);
    }
  }, [formData.patient_id]);

  useEffect(() => {
    if (formData.admission_id) {
      loadAdmissionReadiness(formData.admission_id);
    } else {
      setSelectedAdmission(null);
      setAdmissionReadiness(null);
    }
  }, [formData.admission_id]);

  const loadPatients = async () => {
    try {
      // TODO: Load active patients
      const result = await dataGateway.getAllPatients('org-1', undefined, 'active');
      setPatients(result.patients || []);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const loadAdmissions = async (patientId: string) => {
    try {
      const result = await dataGateway.getAdmissions(patientId);
      const activeAdmissions = result.admissions.filter((a: any) => a.status === 'active');
      setAdmissions(activeAdmissions);

      // Auto-select if only one active admission
      if (activeAdmissions.length === 1) {
        setFormData({ ...formData, admission_id: activeAdmissions[0].id });
      }
    } catch (error: any) {
      console.error('Error loading admissions:', error);
      toast.error('Failed to load admissions');
    }
  };

  const loadAdmissionReadiness = async (admissionId: string) => {
    try {
      const result = await dataGateway.getAdmissionReadiness(admissionId);
      setAdmissionReadiness(result);
    } catch (error: any) {
      console.error('Error loading admission readiness:', error);
      toast.error('Failed to load admission readiness');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    // Validation
    if (!formData.patient_id) {
      toast.error('Please select a patient');
      return;
    }

    if (!formData.admission_id) {
      toast.error('Please select an admission');
      return;
    }

    // Check admission readiness
    if (admissionReadiness) {
      const criticalBlockers = admissionReadiness.checklist.filter(
        (item) => item.state === 'blocked' && item.isRequired
      );

      if (criticalBlockers.length > 0) {
        toast.error('Cannot schedule visits - Admission has critical blockers', {
          description: 'Resolve blocked items before scheduling visits.',
          duration: 5000,
        });
        return;
      }

      if (admissionReadiness.state !== 'ready_for_care' && !overrideWarning) {
        toast.warning('Admission is not fully ready', {
          description: 'Some required items are incomplete. Click again to proceed anyway.',
          duration: 5000,
        });
        setOverrideWarning(true);
        return;
      }
    }

    if (recurrence.enabled && recurrence.frequency === 'weekly' && recurrence.daysOfWeek.length === 0) {
      toast.error('Please select at least one day of the week for weekly recurrence');
      return;
    }

    try {
      setLoading(true);

      const visitData = {
        patientId: formData.patient_id,
        admissionId: formData.admission_id,
        visitDate: formData.visit_date,
        visitTime: formData.visit_time,
        visitType: formData.visit_type,
        discipline: formData.discipline,
        clinicianId: profile.id,
        recurrence: recurrence.enabled ? {
          id: `recurrence-${Date.now()}`,
          frequency: recurrence.frequency,
          interval: recurrence.interval,
          daysOfWeek: recurrence.daysOfWeek.length > 0 ? recurrence.daysOfWeek : undefined,
          endDate: recurrence.endType === 'date' ? recurrence.endDate : undefined,
          occurrences: recurrence.endType === 'occurrences' ? recurrence.occurrences : undefined,
        } : undefined,
      };

      const createdVisits = await dataGateway.evvGateway.createManualVisit(visitData);

      const message = recurrence.enabled 
        ? `Created ${createdVisits.length} visits with recurrence pattern`
        : 'Manual visit created successfully';

      toast.success(message);
      navigate('/poc');
    } catch (error: any) {
      console.error('Error creating visit:', error);
      toast.error('Failed to create visit');
    } finally {
      setLoading(false);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <PageLayout>
      <PageHeader
        title="Create Manual Visit"
        subtitle="Add an unscheduled visit with optional recurrence"
        backButton
        onBack={() => navigate('/poc')}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Admission Readiness Check */}
        {admissionReadiness && formData.admission_id && (
          <InlineReadinessCheck
            readiness={admissionReadiness}
            admissionId={formData.admission_id}
            patientName={patients.find(p => p.id === formData.patient_id)?.first_name + ' ' + patients.find(p => p.id === formData.patient_id)?.last_name}
            onNavigateToItem={(item) => {
              toast.info(`Navigate to: ${item.label}`, {
                description: 'This would take you to the admission form to complete this item.',
              });
            }}
            compact={admissionReadiness.state === 'ready_for_care'}
          />
        )}

        {/* Visit Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Visit Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormSection>
              <FormFieldGroup columns={2}>
                <div className="space-y-2">
                  <Label htmlFor="patient_id">
                    Patient <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData({ ...formData, patient_id: value, admission_id: '' })}
                  >
                    <SelectTrigger id="patient_id">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name} (MRN: {patient.mrn})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admission_id">
                    Admission <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.admission_id}
                    onValueChange={(value) => setFormData({ ...formData, admission_id: value })}
                    disabled={!formData.patient_id}
                  >
                    <SelectTrigger id="admission_id">
                      <SelectValue placeholder="Select admission" />
                    </SelectTrigger>
                    <SelectContent>
                      {admissions.map(admission => (
                        <SelectItem key={admission.id} value={admission.id}>
                          Admitted {admission.admission_date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit_date">
                    Visit Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="visit_date"
                    type="date"
                    value={formData.visit_date}
                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit_time">
                    Visit Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="visit_time"
                    type="time"
                    value={formData.visit_time}
                    onChange={(e) => setFormData({ ...formData, visit_time: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visit_type">
                    Visit Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.visit_type}
                    onValueChange={(value) => setFormData({ ...formData, visit_type: value })}
                  >
                    <SelectTrigger id="visit_type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Skilled Nursing">Skilled Nursing</SelectItem>
                      <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                      <SelectItem value="Occupational Therapy">Occupational Therapy</SelectItem>
                      <SelectItem value="Speech Therapy">Speech Therapy</SelectItem>
                      <SelectItem value="Medical Social Work">Medical Social Work</SelectItem>
                      <SelectItem value="Home Health Aide">Home Health Aide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discipline">
                    Discipline <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.discipline}
                    onValueChange={(value) => setFormData({ ...formData, discipline: value })}
                  >
                    <SelectTrigger id="discipline">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RN">RN - Registered Nurse</SelectItem>
                      <SelectItem value="LPN">LPN - Licensed Practical Nurse</SelectItem>
                      <SelectItem value="PT">PT - Physical Therapist</SelectItem>
                      <SelectItem value="PTA">PTA - Physical Therapy Assistant</SelectItem>
                      <SelectItem value="OT">OT - Occupational Therapist</SelectItem>
                      <SelectItem value="COTA">COTA - Occupational Therapy Assistant</SelectItem>
                      <SelectItem value="ST">ST - Speech Therapist</SelectItem>
                      <SelectItem value="MSW">MSW - Medical Social Worker</SelectItem>
                      <SelectItem value="HHA">HHA - Home Health Aide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormFieldGroup>
            </FormSection>
          </CardContent>
        </Card>

        {/* Recurrence Pattern */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="size-5" />
              Recurrence Pattern (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable_recurrence"
                checked={recurrence.enabled}
                onCheckedChange={(checked) => setRecurrence({ ...recurrence, enabled: checked as boolean })}
              />
              <Label htmlFor="enable_recurrence" className="font-medium">
                Enable recurring visits
              </Label>
            </div>

            {recurrence.enabled && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                <FormFieldGroup columns={2}>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={recurrence.frequency}
                      onValueChange={(value: any) => setRecurrence({ ...recurrence, frequency: value })}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly (Every 2 weeks)</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recurrence.frequency !== 'biweekly' && (
                    <div className="space-y-2">
                      <Label htmlFor="interval">Repeat Every</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="interval"
                          type="number"
                          min="1"
                          max="52"
                          value={recurrence.interval}
                          onChange={(e) => setRecurrence({ ...recurrence, interval: parseInt(e.target.value) })}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600">
                          {recurrence.frequency === 'daily' ? 'days' :
                           recurrence.frequency === 'weekly' ? 'weeks' : 'months'}
                        </span>
                      </div>
                    </div>
                  )}
                </FormFieldGroup>

                {recurrence.frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Days of Week</Label>
                    <div className="flex gap-2">
                      {dayNames.map((day, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={recurrence.daysOfWeek.includes(index) ? 'default' : 'outline'}
                          size="sm"
                          className="w-12"
                          onClick={() => {
                            const newDays = recurrence.daysOfWeek.includes(index)
                              ? recurrence.daysOfWeek.filter(d => d !== index)
                              : [...recurrence.daysOfWeek, index].sort();
                            setRecurrence({ ...recurrence, daysOfWeek: newDays });
                          }}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <FormFieldGroup columns={2}>
                  <div className="space-y-2">
                    <Label htmlFor="end_type">End</Label>
                    <Select
                      value={recurrence.endType}
                      onValueChange={(value: any) => setRecurrence({ ...recurrence, endType: value })}
                    >
                      <SelectTrigger id="end_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">On Date</SelectItem>
                        <SelectItem value="occurrences">After Number of Visits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recurrence.endType === 'date' ? (
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={recurrence.endDate || ''}
                        onChange={(e) => setRecurrence({ ...recurrence, endDate: e.target.value })}
                        min={formData.visit_date}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="occurrences">Number of Visits</Label>
                      <Input
                        id="occurrences"
                        type="number"
                        min="1"
                        max="365"
                        value={recurrence.occurrences || ''}
                        onChange={(e) => setRecurrence({ ...recurrence, occurrences: parseInt(e.target.value) })}
                      />
                    </div>
                  )}
                </FormFieldGroup>

                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  <strong>Preview:</strong> {getRecurrencePreview()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/poc')}
            disabled={loading}
          >
            <X className="size-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="size-4 mr-2" />
            {loading ? 'Creating...' : recurrence.enabled ? 'Create Recurring Visits' : 'Create Visit'}
          </Button>
        </div>
      </form>
    </PageLayout>
  );

  function getRecurrencePreview(): string {
    if (!recurrence.enabled) return 'Recurrence disabled';

    let preview = `Creates visits ${recurrence.frequency}`;
    
    if (recurrence.frequency !== 'biweekly') {
      preview += ` (every ${recurrence.interval} ${
        recurrence.frequency === 'daily' ? 'day' :
        recurrence.frequency === 'weekly' ? 'week' : 'month'
      }${recurrence.interval > 1 ? 's' : ''})`;
    }

    if (recurrence.frequency === 'weekly' && recurrence.daysOfWeek.length > 0) {
      preview += ` on ${recurrence.daysOfWeek.map(d => dayNames[d]).join(', ')}`;
    }

    if (recurrence.endType === 'date' && recurrence.endDate) {
      preview += ` until ${recurrence.endDate}`;
    } else if (recurrence.endType === 'occurrences' && recurrence.occurrences) {
      preview += ` for ${recurrence.occurrences} visits`;
    }

    return preview;
  }
}