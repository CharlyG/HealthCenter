/**
 * Admission Info Tab
 * Core admission fields: date, office, physician, account number, CBSA code
 */
import { useState } from 'react';
import { Save, Calendar, Building2, UserCog, FileText, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { FormSection, FormFieldGroup } from '../../design-system/FormSection';
import { useFormAutosave } from '../../../hooks/useFormAutosave';
import { useOffices } from '../../../hooks/useOffices';

interface AdmissionInfoTabProps {
  admission: any | null;
  isNew: boolean;
}

interface AdmissionFormData {
  patient_id: string;
  admission_date: string;
  office_id: string;
  physician_name: string;
  physician_npi: string;
  account_number: string;
  cbsa_code: string;
  discharge_date: string;
  discharge_code: string;
}

export default function AdmissionInfoTab({ admission, isNew }: AdmissionInfoTabProps) {
  const { offices } = useOffices();
  const [formData, setFormData] = useState<AdmissionFormData>({
    patient_id: admission?.patient_id || '',
    admission_date: admission?.admission_date || '',
    office_id: admission?.office_id || '',
    physician_name: admission?.physician_name || '',
    physician_npi: admission?.physician_npi || '',
    account_number: admission?.account_number || '',
    cbsa_code: admission?.cbsa_code || '',
    discharge_date: admission?.discharge_date || '',
    discharge_code: admission?.discharge_code || '',
  });

  const handleSave = async (data: AdmissionFormData, isDraft: boolean) => {
    // TODO: Call dataGateway.updateAdmission or createAdmission
    console.log('Saving admission:', data, isDraft);
    toast.success('Admission saved successfully');
  };

  const {
    isDirty,
    isSaving,
    lastSaved,
    saveNow,
  } = useFormAutosave({
    formData,
    onSave: handleSave,
    enabled: !isNew,
  });

  const handleFieldChange = (field: keyof AdmissionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExplicitSave = async () => {
    await saveNow(false);
  };

  const isDischarged = !!formData.discharge_date;

  return (
    <div className="space-y-6">
      {/* Autosave Status */}
      {!isNew && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isSaving && <span>Saving...</span>}
            {!isSaving && isDirty && <span>Unsaved changes</span>}
            {!isSaving && !isDirty && lastSaved && (
              <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
            )}
          </div>
          <Button onClick={handleExplicitSave} disabled={isSaving || !isDirty}>
            <Save className="size-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Now'}
          </Button>
        </div>
      )}

      {/* Core Admission Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Admission Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormSection>
            <FormFieldGroup columns={2}>
              <div>
                <Label htmlFor="admission_date">
                  Admission Date *
                  <Calendar className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Input
                  id="admission_date"
                  type="date"
                  value={formData.admission_date}
                  onChange={(e) => handleFieldChange('admission_date', e.target.value)}
                  disabled={isDischarged}
                  required
                />
              </div>

              <div>
                <Label htmlFor="office_id">
                  Office *
                  <Building2 className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Select
                  value={formData.office_id}
                  onValueChange={(value) => handleFieldChange('office_id', value)}
                  disabled={isDischarged}
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
                <Label htmlFor="physician_name">
                  Physician Name *
                  <UserCog className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Input
                  id="physician_name"
                  value={formData.physician_name}
                  onChange={(e) => handleFieldChange('physician_name', e.target.value)}
                  placeholder="Dr. John Smith"
                  required
                />
              </div>

              <div>
                <Label htmlFor="physician_npi">
                  Physician NPI *
                </Label>
                <Input
                  id="physician_npi"
                  value={formData.physician_npi}
                  onChange={(e) => handleFieldChange('physician_npi', e.target.value)}
                  placeholder="1234567890"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <Label htmlFor="account_number">
                  Account Number *
                  <FileText className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => handleFieldChange('account_number', e.target.value)}
                  placeholder="ACC-2024-001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cbsa_code">
                  CBSA Code *
                  <MapPin className="inline size-4 ml-1 text-gray-400" />
                </Label>
                <Input
                  id="cbsa_code"
                  value={formData.cbsa_code}
                  onChange={(e) => handleFieldChange('cbsa_code', e.target.value)}
                  placeholder="16980"
                  maxLength={5}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Core Based Statistical Area code for geographic location
                </p>
              </div>
            </FormFieldGroup>
          </FormSection>
        </CardContent>
      </Card>

      {/* Discharge Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Discharge Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isDischarged ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">Patient has not been discharged</p>
              <Button variant="outline">Discharge Patient</Button>
            </div>
          ) : (
            <FormSection>
              <FormFieldGroup columns={2}>
                <div>
                  <Label htmlFor="discharge_date">Discharge Date</Label>
                  <Input
                    id="discharge_date"
                    type="date"
                    value={formData.discharge_date}
                    onChange={(e) => handleFieldChange('discharge_date', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="discharge_code">Discharge Disposition Code</Label>
                  <Select
                    value={formData.discharge_code}
                    onValueChange={(value) => handleFieldChange('discharge_code', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select disposition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">Discharge to home</SelectItem>
                      <SelectItem value="02">Discharge to another agency</SelectItem>
                      <SelectItem value="03">Discharge to inpatient facility</SelectItem>
                      <SelectItem value="04">Expired</SelectItem>
                      <SelectItem value="05">Discharge against medical advice</SelectItem>
                      <SelectItem value="06">Transfer to another OASIS-certified agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormFieldGroup>

              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This admission record is maintained for historical integrity. 
                  The record cannot be deleted but can be archived.
                </p>
              </div>
            </FormSection>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
