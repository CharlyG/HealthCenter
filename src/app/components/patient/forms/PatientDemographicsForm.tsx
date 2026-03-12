/**
 * Patient Module - Demographics Form Component
 * Modular form with sections, autosave, and proper separation of concerns
 */
import React, { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { FormSection, FormFieldGroup } from '../../design-system/FormSection';
import { Patient } from '../../../hooks/usePatients';
import { Office } from '../../../hooks/useOffices';

export interface DemographicsFormData {
  first_name: string;
  last_name: string;
  dob: string;
  mrn: string;
  office_id: string;
  phone: string;
  address: string;
  status: string;
  email: string;
  gender: string;
  ssn: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

interface PatientDemographicsFormProps {
  patient: Patient | null;
  offices: Office[];
  isNewPatient: boolean;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  formData: DemographicsFormData;
  onFieldChange: (field: keyof DemographicsFormData, value: string) => void;
  onSave: () => void;
}

export const PatientDemographicsForm = React.memo(({
  patient,
  offices,
  isNewPatient,
  isDirty,
  isSaving,
  lastSaved,
  formData,
  onFieldChange,
  onSave,
}: PatientDemographicsFormProps) => {
  return (
    <FormSection
      title="Patient Demographics"
      isDirty={isDirty}
      isSaving={isSaving}
      lastSaved={lastSaved}
      onSave={onSave}
    >
      <div className="grid grid-cols-2 gap-6">
        {/* Basic Information */}
        <FormFieldGroup title="Basic Information" columns={2}>
          <div>
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => onFieldChange('first_name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => onFieldChange('last_name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="dob">Date of Birth *</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => onFieldChange('dob', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(val) => onFieldChange('gender', val)}
            >
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
              onChange={(e) => onFieldChange('mrn', e.target.value)}
              required
              disabled={!isNewPatient}
              className="font-mono"
            />
          </div>

          <div>
            <Label htmlFor="ssn">SSN</Label>
            <Input
              id="ssn"
              value={formData.ssn}
              onChange={(e) => onFieldChange('ssn', e.target.value)}
              placeholder="XXX-XX-XXXX"
              className="font-mono"
            />
          </div>

          <div>
            <Label htmlFor="office_id">Office *</Label>
            <Select 
              value={formData.office_id} 
              onValueChange={(val) => onFieldChange('office_id', val)}
            >
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
            <Select 
              value={formData.status} 
              onValueChange={(val) => onFieldChange('status', val)}
            >
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
        </FormFieldGroup>

        {/* Contact Information */}
        <FormFieldGroup title="Contact Information" columns={2}>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => onFieldChange('phone', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onFieldChange('email', e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => onFieldChange('address', e.target.value)}
              required
            />
          </div>
        </FormFieldGroup>

        {/* Emergency Contact */}
        <FormFieldGroup title="Emergency Contact" columns={2}>
          <div>
            <Label htmlFor="emergency_contact_name">Name</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => onFieldChange('emergency_contact_name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="emergency_contact_phone">Phone</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) => onFieldChange('emergency_contact_phone', e.target.value)}
            />
          </div>
        </FormFieldGroup>
      </div>
    </FormSection>
  );
});

PatientDemographicsForm.displayName = 'PatientDemographicsForm';
