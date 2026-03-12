import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import * as dataGateway from '../lib/dataGateway';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, FileText, Calendar, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  office_id: string;
}

interface Admission {
  id: string;
  patient_id: string;
  office_id: string;
  office_name?: string;
  admission_date: string;
  discharge_date?: string;
  status: string;
  admission_type?: string;
  primary_diagnosis?: string;
  created_at: string;
}

interface PatientAdmissionsProps {
  patient: Patient;
}

export default function PatientAdmissions({ patient }: PatientAdmissionsProps) {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdmissions();
  }, [patient.id]);

  const loadAdmissions = async () => {
    try {
      setLoading(true);
      const res = await dataGateway.getAdmissions(patient.id);
      setAdmissions(res.admissions || []);
    } catch (error: any) {
      console.error('Error loading admissions:', error);
      toast.error(error.message || 'Failed to load admissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmission = () => {
    navigate(`/patient/${patient.id}/admission/new`);
  };

  const handleViewAdmission = (admissionId: string) => {
    navigate(`/patient/${patient.id}/admission/${admissionId}`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'discharged':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Admissions</CardTitle>
          <Button onClick={handleCreateAdmission}>
            <Plus className="size-4 mr-2" />
            New Admission
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {admissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="size-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No admissions</p>
            <p className="text-sm">Create an admission to begin tracking patient care</p>
          </div>
        ) : (
          <div className="space-y-4">
            {admissions.map((admission) => (
              <div
                key={admission.id}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewAdmission(admission.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="size-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Admission {formatDate(admission.admission_date)}
                      </h3>
                      <Badge className={getStatusColor(admission.status)}>
                        {admission.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Admission Date:</span>
                        <p className="text-gray-900 font-medium">
                          <Calendar className="size-3 inline mr-1" />
                          {formatDate(admission.admission_date)}
                        </p>
                      </div>
                      {admission.discharge_date && (
                        <div>
                          <span className="text-gray-500">Discharge Date:</span>
                          <p className="text-gray-900 font-medium">
                            <Calendar className="size-3 inline mr-1" />
                            {formatDate(admission.discharge_date)}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Office:</span>
                        <p className="text-gray-900 font-medium">
                          <Building2 className="size-3 inline mr-1" />
                          {admission.office_name || admission.office_id}
                        </p>
                      </div>
                    </div>
                    {admission.primary_diagnosis && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Primary Diagnosis:</span>
                        <p className="text-gray-900">{admission.primary_diagnosis}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
