/**
 * Admissions Workspace - Dashboard View
 * Shows admissions by status: needing completion, insurance issues, missing fields, etc.
 * Connected to admissionGateway.search() — no inline mock data.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, AlertTriangle, FileCheck, Clock, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageLayout, PageHeader, PageSection } from '../components/design-system/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CompactTable } from '../components/design-system/CompactTable';
import { admissionGateway, type Admission } from '../lib/dataGateway';

/** Enriched admission with pass-through fields from the server */
interface EnrichedAdmission extends Admission {
  _patientName?: string;
  _patientMrn?: string;
  _issues?: string[];
}

export default function AdmissionsWorkspace() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [currentTab, setCurrentTab] = useState('needing-completion');
  const [admissions, setAdmissions] = useState<EnrichedAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await admissionGateway.search({
        pagination: { page: 1, pageSize: 500 },
      });
      // Derive issues list from missing data
      const enriched: EnrichedAdmission[] = res.data.map((a: any) => {
        const issues: string[] = [];
        if (!a.primaryPayerId && !a._primaryPayer) issues.push('Missing insurance');
        if (!a.primaryDiagnosis) issues.push('Missing diagnoses');
        if (a.status === 'pending') issues.push('Authorization pending');
        return { ...a, _issues: issues };
      });
      setAdmissions(enriched);
    } catch (err: any) {
      console.error('[AdmissionsWorkspace] fetch error:', err);
      setError(err.message || 'Failed to load admissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  // Categorise
  const needingCompletion = useMemo(
    () => admissions.filter(a => a.status === 'pending' || (a._issues && a._issues.length > 0)),
    [admissions],
  );
  const insuranceIssues = useMemo(
    () => admissions.filter(a => a._issues?.some(i => i.toLowerCase().includes('insurance') || i.toLowerCase().includes('authorization'))),
    [admissions],
  );
  const missingFields = useMemo(
    () => admissions.filter(a => a._issues?.some(i => i.toLowerCase().includes('missing'))),
    [admissions],
  );
  const authMissing = useMemo(
    () => admissions.filter(a => a._issues?.some(i => i.toLowerCase().includes('authorization'))),
    [admissions],
  );
  const readyForScheduling = useMemo(
    () => admissions.filter(a => a.status === 'active' && (!a._issues || a._issues.length === 0)),
    [admissions],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'incomplete':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'discharged':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const columns = [
    {
      key: 'patient_name',
      header: 'Patient',
      render: (admission: EnrichedAdmission) => (
        <div>
          <div className="font-semibold text-gray-900">{(admission as any)._patientName || `Patient ${admission.patientId}`}</div>
          <div className="text-xs text-gray-500">{(admission as any)._patientMrn || ''}</div>
        </div>
      ),
    },
    {
      key: 'admission_date',
      header: 'Admission Date',
      render: (admission: EnrichedAdmission) => (
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-gray-400" />
          <span>{admission.admissionDate}</span>
        </div>
      ),
    },
    {
      key: 'office_name',
      header: 'Office',
      render: (admission: EnrichedAdmission) => admission.officeId || '—',
    },
    {
      key: 'primary_payer',
      header: 'Primary Payer',
      render: (admission: EnrichedAdmission) => (
        <span>{admission.primaryPayerId || 'Not set'}</span>
      ),
    },
    {
      key: 'issues',
      header: 'Issues',
      render: (admission: EnrichedAdmission) => (
        <div className="flex flex-wrap gap-1">
          {(!admission._issues || admission._issues.length === 0) ? (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="size-3 mr-1" />
              Complete
            </Badge>
          ) : (
            admission._issues.map((issue, idx) => (
              <Badge key={idx} variant="outline" className="bg-red-50 text-red-700 border-red-300">
                <AlertTriangle className="size-3 mr-1" />
                {issue}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (admission: EnrichedAdmission) => (
        <Badge className={getStatusColor(admission.status)}>
          {admission.status}
        </Badge>
      ),
    },
  ];

  const handleRowClick = (admission: EnrichedAdmission) => {
    navigate(`/admissions/${admission.id}`);
  };

  if (loading) {
    return (
      <PageLayout maxWidth="2xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-8 animate-spin text-blue-500" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout maxWidth="2xl">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="size-10 text-red-400 mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAdmissions}>Retry</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        icon={<FileCheck className="size-8" />}
        title="Admissions Workspace"
        subtitle="Manage patient admissions and track completion status"
        actions={
          <Button onClick={() => navigate('/new-admission')}>
            <Plus className="size-4 mr-2" />
            New Admission
          </Button>
        }
      />

      {/* Summary Cards */}
      <PageSection>
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Needing Completion</p>
                  <p className="text-3xl font-bold text-red-600">{needingCompletion.length}</p>
                </div>
                <Clock className="size-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Insurance Issues</p>
                  <p className="text-3xl font-bold text-orange-600">{insuranceIssues.length}</p>
                </div>
                <AlertTriangle className="size-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Missing Fields</p>
                  <p className="text-3xl font-bold text-orange-600">{missingFields.length}</p>
                </div>
                <AlertTriangle className="size-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Auth Missing</p>
                  <p className="text-3xl font-bold text-yellow-600">{authMissing.length}</p>
                </div>
                <FileCheck className="size-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ready to Schedule</p>
                  <p className="text-3xl font-bold text-green-600">{readyForScheduling.length}</p>
                </div>
                <CheckCircle className="size-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      {/* Tabbed Views */}
      <PageSection>
        <Card>
          <CardContent className="p-0">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <div className="border-b">
                <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0">
                  <TabsTrigger
                    value="needing-completion"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    Needing Completion ({needingCompletion.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="insurance-issues"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    Insurance Issues ({insuranceIssues.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="missing-fields"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    Missing Fields ({missingFields.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="auth-missing"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    Auth Missing ({authMissing.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="ready"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
                  >
                    Ready for Scheduling ({readyForScheduling.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="needing-completion" className="mt-0">
                  <CompactTable
                    columns={columns}
                    data={needingCompletion}
                    keyExtractor={(admission) => admission.id}
                    onRowClick={handleRowClick}
                    emptyMessage="No admissions needing completion"
                  />
                </TabsContent>

                <TabsContent value="insurance-issues" className="mt-0">
                  <CompactTable
                    columns={columns}
                    data={insuranceIssues}
                    keyExtractor={(admission) => admission.id}
                    onRowClick={handleRowClick}
                    emptyMessage="No insurance issues"
                  />
                </TabsContent>

                <TabsContent value="missing-fields" className="mt-0">
                  <CompactTable
                    columns={columns}
                    data={missingFields}
                    keyExtractor={(admission) => admission.id}
                    onRowClick={handleRowClick}
                    emptyMessage="No admissions with missing fields"
                  />
                </TabsContent>

                <TabsContent value="auth-missing" className="mt-0">
                  <CompactTable
                    columns={columns}
                    data={authMissing}
                    keyExtractor={(admission) => admission.id}
                    onRowClick={handleRowClick}
                    emptyMessage="No admissions with missing authorization"
                  />
                </TabsContent>

                <TabsContent value="ready" className="mt-0">
                  <CompactTable
                    columns={columns}
                    data={readyForScheduling}
                    keyExtractor={(admission) => admission.id}
                    onRowClick={handleRowClick}
                    emptyMessage="No admissions ready for scheduling"
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </PageSection>
    </PageLayout>
  );
}
