/**
 * PatientDemographics Section
 * Patient-level demographic information and editing
 */
import { useState, useCallback } from 'react';
import { Edit2, Save, Loader2, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Patient } from '../../../hooks/usePatients';
import { useOffices } from '../../../hooks/useOffices';
import { useFormAutosave } from '../../../hooks/useFormAutosave';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { FormSection, FormFieldGroup } from '../../design-system/FormSection';
import { patientGateway } from '../../../lib/dataGateway';

interface PatientDemographicsProps {
  patient: Patient;
  onUpdate?: (updated: Patient) => void;
}

export default function PatientDemographics({ patient, onUpdate }: PatientDemographicsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(patient);
  const [isSaving, setIsSaving] = useState(false);
  const { offices } = useOffices();

  const handleChange = useCallback((field: keyof Patient, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await patientGateway.update(patient.id, formData);
      toast.success('Demographics updated successfully');
      setIsEditing(false);
      onUpdate?.(formData);
    } catch (err) {
      console.error('[PatientDemographics] Save error:', err);
      toast.error('Failed to update demographics');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(patient);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="size-6 text-gray-600" />
            Patient Demographics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Patient-level demographic and contact information
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} size="sm">
            <Edit2 className="size-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} size="sm" disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="size-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormSection>
            <FormFieldGroup columns={3}>
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <Label htmlFor="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  value={formData.middle_name || ''}
                  onChange={(e) => handleChange('middle_name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
            </FormFieldGroup>

            <FormFieldGroup columns={3}>
              <div>
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob || ''}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(val) => handleChange('gender', val)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="gender">
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
                <Label htmlFor="mrn">MRN</Label>
                <Input
                  id="mrn"
                  value={formData.mrn || ''}
                  onChange={(e) => handleChange('mrn', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </FormFieldGroup>

            <FormFieldGroup columns={2}>
              <div>
                <Label htmlFor="ssn">SSN</Label>
                <Input
                  id="ssn"
                  type="password"
                  value={formData.ssn || ''}
                  onChange={(e) => handleChange('ssn', e.target.value)}
                  disabled={!isEditing}
                  placeholder="***-**-****"
                />
              </div>
              <div>
                <Label htmlFor="office_id">Office</Label>
                <Select
                  value={formData.office_id || ''}
                  onValueChange={(val) => handleChange('office_id', val)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="office_id">
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
            </FormFieldGroup>
          </FormSection>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="size-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormSection>
            <FormFieldGroup columns={2}>
              <div>
                <Label htmlFor="phone">Primary Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </FormFieldGroup>

            <FormFieldGroup columns={1}>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </FormFieldGroup>

            <FormFieldGroup columns={3}>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  disabled={!isEditing}
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip || ''}
                  onChange={(e) => handleChange('zip', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </FormFieldGroup>
          </FormSection>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="size-4" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormSection>
            <FormFieldGroup columns={2}>
              <div>
                <Label htmlFor="emergency_contact_name">Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  type="tel"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </FormFieldGroup>

            <FormFieldGroup columns={1}>
              <div>
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input
                  id="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship || ''}
                  onChange={(e) => handleChange('emergency_contact_relationship', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </FormFieldGroup>
          </FormSection>
        </CardContent>
      </Card>
    </div>
  );
}
