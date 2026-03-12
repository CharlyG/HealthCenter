/**
 * Patient Module - Details Page (Container)
 * Orchestrates patient profile display with tabbed content
 */
import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, User } from 'lucide-react';
import { toast } from 'sonner';
import { usePatient } from '../hooks/usePatients';
import { useOffices } from '../hooks/useOffices';
import { useFormAutosave } from '../hooks/useFormAutosave';
import { useNavigationGuard } from '../hooks/useNavigationGuard';
import { PatientContextHeader } from '../components/design-system/PatientContextHeader';
import { PageLayout } from '../components/design-system/PageLayout';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PatientDemographicsForm, DemographicsFormData } from '../components/patient/forms/PatientDemographicsForm';
import PatientAlternateLocations from '../components/PatientAlternateLocations';
import PatientAdmissions from '../components/PatientAdmissions';
import PatientDocuments from '../components/PatientDocuments';

export default function PatientDetailsPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const isNewPatient = patientId === 'new';
  
  const [currentTab, setCurrentTab] = useState('demographics');

  // Data hooks
  const { patient, loading, update } = usePatient(isNewPatient ? undefined : patientId);
  const { offices } = useOffices();

  // Form state
  const [formData, setFormData] = useState<DemographicsFormData>({
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

  const handleSave = async (data: DemographicsFormData, isDraft: boolean) => {
    if (isNewPatient) {
      // Create logic handled separately
      return;
    }

    await update({
      ...data,
      is_draft: isDraft,
    });
  };

  const {
    isDirty,
    isSaving,
    lastSaved,
    saveNow,
  } = useFormAutosave({
    formData,
    onSave: handleSave,
    enabled: !isNewPatient,
  });

  // Navigation guard
  useNavigationGuard({
    when: isDirty && !isSaving,
    onConfirm: async () => {
      await saveNow(false);
    },
    message: 'You have unsaved changes. Save before leaving?',
  });

  const handleFieldChange = (field: keyof DemographicsFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleExplicitSave = async () => {
    try {
      await saveNow(false);
      toast.success('Changes saved successfully');
    } catch (error) {
      // Error already handled by useFormAutosave
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient...</p>
        </div>
      </div>
    );
  }

  if (!patient && !isNewPatient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <User className="size-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Patient not found</p>
          <Button onClick={() => navigate('/patient')}>Back to Patient List</Button>
        </div>
      </div>
    );
  }

  const officeForPatient = offices.find(o => o.id === patient?.office_id);

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Patient Context Header */}
      {patient && (
        <PatientContextHeader
          patient={{
            ...patient,
            office_name: officeForPatient?.name,
          }}
        />
      )}

      <PageLayout>
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/patient')}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Patients
          </Button>

          {!patient && (
            <div className="flex items-center gap-3">
              <User className="size-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  New Patient
                </h1>
                <p className="text-gray-600">Create a new patient record</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="locations" disabled={!patient}>
              Alternate Locations
            </TabsTrigger>
            <TabsTrigger value="admissions" disabled={!patient}>
              Admissions
            </TabsTrigger>
            <TabsTrigger value="documents" disabled={!patient}>
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demographics">
            <PatientDemographicsForm
              patient={patient}
              offices={offices}
              isNewPatient={isNewPatient}
              isDirty={isDirty}
              isSaving={isSaving}
              lastSaved={lastSaved}
              formData={formData}
              onFieldChange={handleFieldChange}
              onSave={handleExplicitSave}
            />
          </TabsContent>

          <TabsContent value="locations">
            {patient && <PatientAlternateLocations patientId={patient.id} />}
          </TabsContent>

          <TabsContent value="admissions">
            {patient && <PatientAdmissions patient={patient} />}
          </TabsContent>

          <TabsContent value="documents">
            {patient && <PatientDocuments patientId={patient.id} />}
          </TabsContent>
        </Tabs>
      </PageLayout>
    </div>
  );
}