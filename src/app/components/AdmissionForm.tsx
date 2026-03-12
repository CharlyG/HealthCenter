import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useFormAutosave } from '../hooks/useFormAutosave';
import { useNavigationGuard } from '../hooks/useNavigationGuard';
import * as dataGateway from '../lib/dataGateway';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Save, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Admission {
  id: string;
  patient_id: string;
  office_id: string;
  admission_date: string;
  discharge_date?: string;
  status: string;
  admission_type?: string;
  primary_diagnosis?: string;
  referral_source?: string;
  physician_name?: string;
  physician_phone?: string;
}

interface Office {
  id: string;
  name: string;
}

interface AdmissionFormProps {
  patientId: string;
  admission: Admission | null;
  onUpdate: (admission: Admission) => void;
  isNewAdmission: boolean;
}

export default function AdmissionForm({
  patientId,
  admission,
  onUpdate,
  isNewAdmission,
}: AdmissionFormProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [offices, setOffices] = useState<Office[]>([]);
  const [formData, setFormData] = useState({
    office_id: admission?.office_id || '',
    admission_date: admission?.admission_date || new Date().toISOString().split('T')[0],
    discharge_date: admission?.discharge_date || '',
    status: admission?.status || 'pending',
    admission_type: admission?.admission_type || '',
    primary_diagnosis: admission?.primary_diagnosis || '',
    referral_source: admission?.referral_source || '',
    physician_name: admission?.physician_name || '',
    physician_phone: admission?.physician_phone || '',
  });

  useEffect(() => {
    loadOffices();
  }, [profile?.org_id]);

  const loadOffices = async () => {
    if (!profile?.org_id) return;

    try {
      const res = await dataGateway.getOffices(profile.org_id);
      setOffices(res.offices || []);
    } catch (error: any) {
      console.error('Error loading offices:', error);
      toast.error('Failed to load offices');
    }
  };

  const handleSave = async (data: typeof formData, isDraft: boolean) => {
    if (isNewAdmission) {
      // Create new admission
      const res = await dataGateway.createAdmission(
        patientId,
        data.office_id,
        data.admission_date,
        {
          ...data,
          is_draft: isDraft,
        }
      );
      onUpdate(res.admission);
      if (!isDraft) {
        toast.success('Admission created successfully');
        navigate(`/patient/${patientId}/admission/${res.admission.id}`);
      }
    } else if (admission) {
      // Update existing admission
      const res = await dataGateway.updateAdmission(admission.id, {
        ...data,
        is_draft: isDraft,
      });
      onUpdate(res.admission);
    }
  };

  const {
    isDirty,
    isSaving,
    lastSaved,
    saveNow,
    markClean,
  } = useFormAutosave({
    formData,
    onSave: handleSave,
    enabled: !isNewAdmission, // Only autosave for existing admissions
  });

  // Navigation guard
  useNavigationGuard({
    when: isDirty && !isSaving,
    onConfirm: async () => {
      await saveNow(false);
    },
    message: 'You have unsaved changes. Save before leaving?',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExplicitSave = async () => {
    try {
      await saveNow(false);
    } catch (error) {
      // Error already handled by useFormAutosave
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Admission Information</CardTitle>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="size-4" />
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            {isDirty && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                Unsaved changes
              </Badge>
            )}
            <Button
              onClick={handleExplicitSave}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          </div>

          <div>
            <Label htmlFor="office_id">Office *</Label>
            <Select value={formData.office_id} onValueChange={(val) => handleInputChange('office_id', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select office" />
              </SelectTrigger>
              <SelectContent>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(val) => handleInputChange('status', val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="admission_date">Admission Date *</Label>
            <Input
              id="admission_date"
              type="date"
              value={formData.admission_date}
              onChange={(e) => handleInputChange('admission_date', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="discharge_date">Discharge Date</Label>
            <Input
              id="discharge_date"
              type="date"
              value={formData.discharge_date}
              onChange={(e) => handleInputChange('discharge_date', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="admission_type">Admission Type</Label>
            <Select value={formData.admission_type} onValueChange={(val) => handleInputChange('admission_type', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="elective">Elective</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="referral_source">Referral Source</Label>
            <Input
              id="referral_source"
              value={formData.referral_source}
              onChange={(e) => handleInputChange('referral_source', e.target.value)}
              placeholder="e.g., Dr. Smith, Hospital XYZ"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="primary_diagnosis">Primary Diagnosis</Label>
            <Textarea
              id="primary_diagnosis"
              value={formData.primary_diagnosis}
              onChange={(e) => handleInputChange('primary_diagnosis', e.target.value)}
              rows={3}
            />
          </div>

          {/* Physician Information */}
          <div className="col-span-2 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attending Physician</h3>
          </div>

          <div>
            <Label htmlFor="physician_name">Physician Name</Label>
            <Input
              id="physician_name"
              value={formData.physician_name}
              onChange={(e) => handleInputChange('physician_name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="physician_phone">Physician Phone</Label>
            <Input
              id="physician_phone"
              type="tel"
              value={formData.physician_phone}
              onChange={(e) => handleInputChange('physician_phone', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
