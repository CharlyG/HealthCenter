/**
 * Admission Detail Page - Tabbed Interface
 * Full admission management with all required sections.
 * Connected to admissionGateway.getById() — no inline mock data.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, FileText, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { PageLayout } from '../components/design-system/PageLayout';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { admissionGateway, patientGateway, type Admission } from '../lib/dataGateway';

// Tab components
import AdmissionInfoTab from '../components/admissions/tabs/AdmissionInfoTab';
import AdmissionInsuranceTab from '../components/admissions/tabs/AdmissionInsuranceTab';
import AdmissionDiagnosesTab from '../components/admissions/tabs/AdmissionDiagnosesTab';
import AdmissionDisciplinesTab from '../components/admissions/tabs/AdmissionDisciplinesTab';
import AdmissionFrequencyTab from '../components/admissions/tabs/AdmissionFrequencyTab';
import AdmissionComplianceTab from '../components/admissions/tabs/AdmissionComplianceTab';

interface AdmissionDetail extends Admission {
  _patientName?: string;
  _patientMrn?: string;
}

export default function AdmissionDetailPage() {
  const { admissionId } = useParams<{ admissionId: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('info');
  const isNewAdmission = admissionId === 'new';

  const [admission, setAdmission] = useState<AdmissionDetail | null>(null);
  const [loading, setLoading] = useState(!isNewAdmission);
  const [error, setError] = useState<string | null>(null);

  const loadAdmission = useCallback(async () => {
    if (isNewAdmission || !admissionId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await admissionGateway.getById(admissionId);
      if (!data) {
        setError('Admission not found');
        return;
      }
      // Enrich with patient name
      let enriched: AdmissionDetail = { ...data };
      if (data.patientId) {
        try {
          const patientRes = await patientGateway.search({
            pagination: { page: 1, pageSize: 500 },
          });
          const patient = patientRes.data.find(p => p.id === data.patientId);
          if (patient) {
            enriched._patientName = `${patient.lastName}, ${patient.firstName}`;
            enriched._patientMrn = patient.mrn;
          }
        } catch {
          // Non-critical — continue without patient name
        }
      }
      setAdmission(enriched);
    } catch (err: any) {
      console.error('[AdmissionDetail] load error:', err);
      setError(err.message || 'Failed to load admission');
    } finally {
      setLoading(false);
    }
  }, [admissionId, isNewAdmission]);

  useEffect(() => {
    loadAdmission();
  }, [loadAdmission]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Error state
  if (error || (!admission && !isNewAdmission)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          {error ? (
            <AlertTriangle className="size-16 mx-auto mb-4 text-red-400" />
          ) : (
            <FileText className="size-16 mx-auto mb-4 text-gray-400" />
          )}
          <p className="text-xl font-semibold text-gray-900 mb-2">{error || 'Admission not found'}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate('/admissions')}>Back to Admissions</Button>
            {error && <Button variant="outline" onClick={loadAdmission}>Retry</Button>}
          </div>
        </div>
      </div>
    );
  }

  const getCompletionStatus = () => {
    if (!admission) return { completed: 0, total: 5, requiredTabs: {} as Record<string, boolean> };
    const requiredTabs: Record<string, boolean> = {
      info: !!admission.admissionDate && !!admission.patientId,
      insurance: !!admission.primaryPayerId,
      diagnoses: !!admission.primaryDiagnosis,
      disciplines: false,
      frequency: false,
    };
    const completed = Object.values(requiredTabs).filter(Boolean).length;
    const total = Object.keys(requiredTabs).length;
    return { completed, total, requiredTabs };
  };

  const { completed, total, requiredTabs } = getCompletionStatus();
  const isComplete = completed === total;

  // Build an admission-like object the tab components expect
  const admissionForTabs = admission ? {
    id: admission.id,
    patient_id: admission.patientId,
    patient_name: admission._patientName || `Patient ${admission.patientId}`,
    mrn: admission._patientMrn || '',
    admission_date: admission.admissionDate,
    office_id: admission.officeId,
    office_name: admission.officeId,
    physician_name: '',
    physician_npi: '',
    account_number: '',
    cbsa_code: '',
    status: admission.status,
    discharge_date: admission.dischargeDate || null,
    discharge_code: null,
    is_deleted: false,
  } : null;

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <PageLayout>
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admissions')}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Admissions
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {isNewAdmission ? 'New Admission' : 'Admission Details'}
                </h1>
                {!isNewAdmission && (
                  <>
                    {isComplete ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="size-4 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        {completed} of {total} sections complete
                      </Badge>
                    )}
                  </>
                )}
              </div>
              {admission && (
                <p className="text-gray-600">
                  Patient: <span className="font-semibold">{admission._patientName || admission.patientId}</span>
                  {admission._patientMrn && <>{' • '}MRN: <span className="font-semibold">{admission._patientMrn}</span></>}
                  {' • '}Admitted: <span className="font-semibold">{admission.admissionDate}</span>
                </p>
              )}
            </div>

            {!isNewAdmission && admission && !admission.dischargeDate && (
              <div className="flex items-center gap-2">
                <Button variant="outline">Discharge</Button>
                {isComplete && <Button>Schedule Visits</Button>}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <div className="border-b border-gray-200 bg-white rounded-t-lg">
            <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0 px-6">
              <TabsTrigger
                value="info"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
              >
                Admission
                {requiredTabs.info && (
                  <CheckCircle className="size-4 ml-2 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="insurance"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
              >
                Insurance
                {requiredTabs.insurance && (
                  <CheckCircle className="size-4 ml-2 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="diagnoses"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
              >
                Diagnoses
                {requiredTabs.diagnoses && (
                  <CheckCircle className="size-4 ml-2 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="disciplines"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
              >
                Disciplines
                {requiredTabs.disciplines && (
                  <CheckCircle className="size-4 ml-2 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="frequency"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
              >
                Frequency
                {requiredTabs.frequency && (
                  <CheckCircle className="size-4 ml-2 text-green-600" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="compliance"
                className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
              >
                Compliance
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="info">
            <AdmissionInfoTab admission={admissionForTabs} isNew={isNewAdmission} />
          </TabsContent>

          <TabsContent value="insurance">
            <AdmissionInsuranceTab admissionId={admission?.id} />
          </TabsContent>

          <TabsContent value="diagnoses">
            <AdmissionDiagnosesTab admissionId={admission?.id} />
          </TabsContent>

          <TabsContent value="disciplines">
            <AdmissionDisciplinesTab admissionId={admission?.id} />
          </TabsContent>

          <TabsContent value="frequency">
            <AdmissionFrequencyTab admissionId={admission?.id} />
          </TabsContent>

          <TabsContent value="compliance">
            <AdmissionComplianceTab admissionId={admission?.id} />
          </TabsContent>
        </Tabs>
      </PageLayout>
    </div>
  );
}
