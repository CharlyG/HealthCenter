import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import * as dataGateway from '../lib/dataGateway';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { toast } from 'sonner';
import AdmissionForm from '../components/AdmissionForm';
import AdmissionInsurance from '../components/AdmissionInsurance';
import AdmissionDiagnoses from '../components/AdmissionDiagnoses';
import AdmissionDisciplines from '../components/AdmissionDisciplines';
import AdmissionFrequency from '../components/AdmissionFrequency';

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

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  mrn: string;
}

export default function AdmissionDetails() {
  const { patientId, admissionId } = useParams<{ patientId: string; admissionId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [admission, setAdmission] = useState<Admission | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('admission');

  useEffect(() => {
    loadData();
  }, [patientId, admissionId]);

  const loadData = async () => {
    if (!patientId) return;

    try {
      setLoading(true);
      const patientRes = await dataGateway.getPatientById(patientId);
      setPatient(patientRes.patient);

      if (admissionId && admissionId !== 'new') {
        const admissionRes = await dataGateway.getAdmissionById(admissionId);
        setAdmission(admissionRes.admission);
      }
    } catch (error: any) {
      console.error('Error loading admission:', error);
      toast.error(error.message || 'Failed to load admission');
    } finally {
      setLoading(false);
    }
  };

  const handleAdmissionUpdate = (updatedAdmission: Admission) => {
    setAdmission(updatedAdmission);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admission...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="size-16 mx-auto mb-4 text-gray-400" />
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
            onClick={() => navigate(`/patient/${patientId}`)}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Patient
          </Button>

          <div className="flex items-center gap-3">
            <FileText className="size-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {admissionId === 'new' ? 'New Admission' : 'Admission Details'}
              </h1>
              <p className="text-gray-600">
                Patient: {patient.last_name}, {patient.first_name} (MRN: {patient.mrn})
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="admission">Admission</TabsTrigger>
            <TabsTrigger value="insurance" disabled={!admission}>Insurance</TabsTrigger>
            <TabsTrigger value="diagnoses" disabled={!admission}>Diagnoses</TabsTrigger>
            <TabsTrigger value="disciplines" disabled={!admission}>Disciplines</TabsTrigger>
            <TabsTrigger value="frequency" disabled={!admission}>Frequency</TabsTrigger>
          </TabsList>

          <TabsContent value="admission">
            <AdmissionForm
              patientId={patientId!}
              admission={admission}
              onUpdate={handleAdmissionUpdate}
              isNewAdmission={admissionId === 'new'}
            />
          </TabsContent>

          <TabsContent value="insurance">
            {admission && <AdmissionInsurance admissionId={admission.id} />}
          </TabsContent>

          <TabsContent value="diagnoses">
            {admission && <AdmissionDiagnoses admissionId={admission.id} />}
          </TabsContent>

          <TabsContent value="disciplines">
            {admission && <AdmissionDisciplines admissionId={admission.id} />}
          </TabsContent>

          <TabsContent value="frequency">
            {admission && <AdmissionFrequency admissionId={admission.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
