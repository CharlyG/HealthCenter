/**
 * PatientAssessments Section
 * Admission-level assessments (OASIS, HOPE, nursing assessments, etc.)
 */
import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Loader2, CheckCircle2, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { assessmentGateway } from '../../../lib/dataGateway';
import NoAdmissionSelected from './NoAdmissionSelected';

interface PatientAssessmentsProps {
  patientId: string;
  admissionId?: string;
}

interface Assessment {
  id: string;
  type: string;
  status: string;
  assessment_date: string;
  completed_by?: string;
  timepoint?: string;
  score?: number;
  created_at: string;
}

export default function PatientAssessments({ patientId, admissionId }: PatientAssessmentsProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admissionId) {
      loadAssessments();
    } else {
      setLoading(false);
    }
  }, [admissionId, patientId]);

  const loadAssessments = async () => {
    if (!admissionId) return;

    setLoading(true);
    try {
      const result = await assessmentGateway.search({
        filters: { patientId, admissionId },
        pagination: { page: 1, pageSize: 100 },
        sorting: { field: 'assessment_date', direction: 'desc' },
      });
      setAssessments(result.data || []);
    } catch (err) {
      console.error('[PatientAssessments] Load error:', err);
      toast.error('Failed to load assessments');
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  if (!admissionId) {
    return (
      <NoAdmissionSelected 
        message="Select an admission to view its assessments"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading assessments...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'signed':
        return <CheckCircle2 className="size-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="size-4 text-blue-600" />;
      case 'pending':
        return <Clock className="size-4 text-yellow-600" />;
      default:
        return <FileText className="size-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'OASIS':
        return 'bg-purple-100 text-purple-800';
      case 'HOPE':
        return 'bg-pink-100 text-pink-800';
      case 'NURSING':
        return 'bg-blue-100 text-blue-800';
      case 'PT':
      case 'OT':
      case 'ST':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="size-6 text-gray-600" />
            Assessments
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Clinical assessments for the selected admission
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {assessments.length} {assessments.length === 1 ? 'Assessment' : 'Assessments'}
          </Badge>
          <Button size="sm">
            <Plus className="size-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Assessments List */}
      {assessments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="bg-gray-100 rounded-full p-4 inline-flex">
                <ClipboardList className="size-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No assessments found</p>
                <p className="text-xs text-gray-600 mt-1">
                  Create your first assessment for this admission
                </p>
              </div>
              <Button size="sm" variant="outline">
                <Plus className="size-4 mr-2" />
                Create Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      {getStatusIcon(assessment.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-gray-900">
                            {assessment.type} Assessment
                          </h4>
                          <Badge className={`${getTypeColor(assessment.type)} text-xs`}>
                            {assessment.type}
                          </Badge>
                          {assessment.timepoint && (
                            <Badge variant="outline" className="text-xs">
                              {assessment.timepoint}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(assessment.status)} text-xs`}>
                        {assessment.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm ml-7">
                      {assessment.completed_by && (
                        <div>
                          <span className="text-gray-600">Completed by:</span>
                          <span className="ml-1 text-gray-900">{assessment.completed_by}</span>
                        </div>
                      )}
                      {assessment.score !== undefined && (
                        <div>
                          <span className="text-gray-600">Score:</span>
                          <span className="ml-1 font-medium text-gray-900">{assessment.score}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
