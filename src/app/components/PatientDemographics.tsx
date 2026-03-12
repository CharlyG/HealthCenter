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
import { Save, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  mrn: string;
  office_id: string;
  phone: string;
  address: string;
  status: string;
  email?: string;
  gender?: string;
  ssn?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface Office {
  id: string;
  name: string;
}

interface PatientDemographicsProps {
  patient: Patient | null;
  onUpdate: (patient: Patient) => void;
  isNewPatient: boolean;
}

export default function PatientDemographics({
  patient,
  onUpdate,
  isNewPatient,
}: PatientDemographicsProps) {
  const navigate = useNavigate();
  const { profile, user, loading: authLoading } = useAuth();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(true);
  const [formData, setFormData] = useState({
    first_name: patient?.first_name || '',
    last_name: patient?.last_name || '',
    dob: patient?.dob || '',
    mrn: patient?.mrn || '',
    office_id: patient?.office_id || '',
    phone: patient?.phone || '',
    address: patient?.address || '',
    status: patient?.status || 'pending',
    email: patient?.email || '',
    gender: patient?.gender || '',
    ssn: patient?.ssn || '',
    emergency_contact_name: patient?.emergency_contact_name || '',
    emergency_contact_phone: patient?.emergency_contact_phone || '',
  });

  useEffect(() => {
    // Wait for auth to be ready before loading offices
    if (!authLoading && user && profile?.org_id) {
      loadOffices();
    } else if (!authLoading) {
      // Auth is loaded but no valid session
      setLoadingOffices(false);
    }
  }, [profile?.org_id, authLoading, user]);

  const loadOffices = async () => {
    if (!profile?.org_id) {
      console.log('[PatientDemographics] No org_id, skipping office load');
      setLoadingOffices(false);
      return;
    }

    try {
      setLoadingOffices(true);
      console.log('[PatientDemographics] Loading offices for org:', profile.org_id);
      const res = await dataGateway.getOffices(profile.org_id);
      setOffices(res.offices || []);
      console.log('[PatientDemographics] Loaded offices:', res.offices?.length);
    } catch (error: any) {
      console.error('[PatientDemographics] Error loading offices:', error);
      // Don't show toast for auth errors - they trigger redirect
      if (!error.message?.includes('Authentication failed') && 
          !error.message?.includes('No active session')) {
        toast.error('Failed to load offices');
      }
    } finally {
      setLoadingOffices(false);
    }
  };

  const handleSave = async (data: typeof formData, isDraft: boolean) => {
    if (!profile?.org_id) throw new Error('No organization');

    if (isNewPatient) {
      // Create new patient
      const res = await dataGateway.createPatient(
        data.office_id,
        data.first_name,
        data.last_name,
        data.dob,
        data.mrn,
        data.phone,
        data.address
      );
      onUpdate(res.patient);
      if (!isDraft) {
        toast.success('Patient created successfully');
        navigate(`/patient/${res.patient.id}`);
      }
    } else if (patient) {
      // Update existing patient
      const res = await dataGateway.updatePatient(patient.id, {
        ...data,
        is_draft: isDraft,
      });
      onUpdate(res.patient);
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
    enabled: !isNewPatient, // Only autosave for existing patients
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
          <CardTitle>Patient Demographics</CardTitle>
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
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => handleInputChange('dob', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(val) => handleInputChange('gender', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mrn">Medical Record Number (MRN) *</Label>
            <Input
              id="mrn"
              value={formData.mrn}
              onChange={(e) => handleInputChange('mrn', e.target.value)}
              required
              disabled={!isNewPatient}
            />
          </div>

          <div>
            <Label htmlFor="ssn">SSN</Label>
            <Input
              id="ssn"
              value={formData.ssn}
              onChange={(e) => handleInputChange('ssn', e.target.value)}
              placeholder="XXX-XX-XXXX"
            />
          </div>

          <div>
            <Label htmlFor="office_id">Office *</Label>
            <Select value={formData.office_id} onValueChange={(val) => handleInputChange('office_id', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select office" />
              </SelectTrigger>
              <SelectContent>
                {loadingOffices ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  offices.map((office) => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.name}
                    </SelectItem>
                  ))
                )}
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

          {/* Contact Information */}
          <div className="col-span-2 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          </div>

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>

          {/* Emergency Contact */}
          <div className="col-span-2 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          </div>

          <div>
            <Label htmlFor="emergency_contact_name">Name</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="emergency_contact_phone">Phone</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}