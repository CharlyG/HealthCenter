import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import * as dataGateway from '../lib/dataGateway';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { toast } from 'sonner';
import PatientDemographics from '../components/PatientDemographics';
import PatientAlternateLocations from '../components/PatientAlternateLocations';
import PatientAdmissions from '../components/PatientAdmissions';
import PatientDocuments from '../components/PatientDocuments';

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

export default function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('demographics');

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    // Skip loading for new patient - no patient to fetch
    if (!patientId || patientId === 'new') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await dataGateway.getPatientById(patientId);
      setPatient(res.patient);
    } catch (error: any) {
      console.error('Error loading patient:', error);
      toast.error(error.message || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientUpdate = (updatedPatient: Patient) => {
    setPatient(updatedPatient);
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

  if (!patient && patientId !== 'new') {
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

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/patient')}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Patients
          </Button>

          {patient ? (
            <div className="flex items-center gap-3">
              <User className="size-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {patient.last_name}, {patient.first_name}
                </h1>
                <p className="text-gray-600">MRN: {patient.mrn}</p>
              </div>
            </div>
          ) : (
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
            <TabsTrigger value="locations" disabled={!patient}>Alternate Locations</TabsTrigger>
            <TabsTrigger value="admissions" disabled={!patient}>Admissions</TabsTrigger>
            <TabsTrigger value="documents" disabled={!patient}>Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="demographics">
            <PatientDemographics
              patient={patient}
              onUpdate={handlePatientUpdate}
              isNewPatient={patientId === 'new'}
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
      </div>
    </div>
  );
}