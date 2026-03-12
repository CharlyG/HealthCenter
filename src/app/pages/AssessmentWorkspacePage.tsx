/**
 * Assessment Workspace Page
 * Central hub for managing clinical assessments across all stages
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Plus,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { AssessmentEngine } from '../components/clinical-assessment/AssessmentEngine';
import { SignatureModal } from '../components/clinical-assessment/SignatureModal';
import { QAReviewPanel } from '../components/clinical-assessment/QAReviewPanel';
import { useAssessmentAPI } from '../hooks/useAssessmentAPI';
import { getAssessmentDefinition } from '../components/clinical-assessment/assessmentDefinitions';
import type { AssessmentInstance } from '../components/clinical-assessment/types';
import { toast } from 'sonner';

type ViewMode = 'list' | 'edit' | 'view' | 'qa-review';

export default function AssessmentWorkspacePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentInstance | null>(null);
  const [assessments, setAssessments] = useState<AssessmentInstance[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentInstance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const api = useAssessmentAPI();

  // Load assessments
  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    const data = await api.listAssessments();
    setAssessments(data);
    setFilteredAssessments(data);
  };

  // Filter assessments
  useEffect(() => {
    let filtered = assessments;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.clinicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAssessments(filtered);
  }, [assessments, statusFilter, searchQuery]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleEdit = (assessment: AssessmentInstance) => {
    setSelectedAssessment(assessment);
    setViewMode('edit');
  };

  const handleView = (assessment: AssessmentInstance) => {
    setSelectedAssessment(assessment);
    setViewMode('view');
  };

  const handleQAReview = (assessment: AssessmentInstance) => {
    setSelectedAssessment(assessment);
    setViewMode('qa-review');
  };

  const handleDelete = async (assessment: AssessmentInstance) => {
    if (!confirm(`Delete assessment for ${assessment.patientName}?`)) return;

    const success = await api.deleteAssessment(assessment.id);
    if (success) {
      toast.success('Assessment deleted');
      loadAssessments();
    } else {
      toast.error('Failed to delete assessment');
    }
  };

  const handleSave = async (data: Record<string, any>) => {
    if (!selectedAssessment) return;

    await api.updateAssessment(selectedAssessment.id, { data });
    loadAssessments();
  };

  const handleSubmit = async (data: Record<string, any>) => {
    if (!selectedAssessment) return;

    const submitted = await api.submitAssessment(selectedAssessment.id, data);

    if (submitted) {
      toast.success('Assessment submitted! Ready for signature.');
      setSelectedAssessment(submitted);
      setShowSignatureModal(true);
    }
  };

  const handleSign = async (signature: {
    signedBy: string;
    signedByRole: string;
    signature: string;
    ipAddress?: string;
  }) => {
    if (!selectedAssessment) return;

    const result = await api.signAssessment(selectedAssessment.id, signature);

    if (result) {
      toast.success('Assessment signed! Sent to QA for review.');
      setShowSignatureModal(false);
      setViewMode('list');
      loadAssessments();
    } else {
      toast.error('Failed to sign assessment');
    }
  };

  const handleQAApprove = async (comments?: string) => {
    if (!selectedAssessment) return;

    const result = await api.submitQAReview(selectedAssessment.id, {
      reviewerId: 'qa-specialist-001',
      reviewerName: 'Jennifer Adams',
      status: 'approved',
      comments,
    });

    if (result) {
      toast.success('Assessment approved!');
      setViewMode('list');
      loadAssessments();
    } else {
      toast.error('Failed to approve assessment');
    }
  };

  const handleQAReject = async (comments: string, issues: any[]) => {
    if (!selectedAssessment) return;

    const result = await api.submitQAReview(selectedAssessment.id, {
      reviewerId: 'qa-specialist-001',
      reviewerName: 'Jennifer Adams',
      status: 'rejected',
      comments,
      issues,
    });

    if (result) {
      toast.success('Assessment rejected. Returned to clinician for revision.');
      setViewMode('list');
      loadAssessments();
    } else {
      toast.error('Failed to reject assessment');
    }
  };

  // ─── Render Edit Mode ──────────────────────────────────────────────────

  if (viewMode === 'edit' && selectedAssessment) {
    const definition = getAssessmentDefinition(selectedAssessment.type as any);
    if (!definition) {
      setViewMode('list');
      return null;
    }

    return (
      <>
        <AssessmentEngine
          definition={definition}
          instance={selectedAssessment}
          onSave={handleSave}
          onSubmit={handleSubmit}
          onCancel={() => setViewMode('list')}
          autoSave={true}
        />
        {showSignatureModal && (
          <SignatureModal
            isOpen={showSignatureModal}
            onClose={() => setShowSignatureModal(false)}
            onSign={handleSign}
            assessmentTitle={definition.title}
            patientName={selectedAssessment.patientName}
            defaultSignatory={{
              name: selectedAssessment.clinicianName,
              role: definition.discipline,
              credentials: 'RN',
            }}
          />
        )}
      </>
    );
  }

  // ─── Render QA Review Mode ─────────────────────────────────────────────

  if (viewMode === 'qa-review' && selectedAssessment) {
    const definition = getAssessmentDefinition(selectedAssessment.type as any);
    if (!definition) {
      setViewMode('list');
      return null;
    }

    return (
      <QAReviewPanel
        assessment={selectedAssessment}
        definition={definition}
        onApprove={handleQAApprove}
        onReject={handleQAReject}
        onClose={() => setViewMode('list')}
      />
    );
  }

  // ─── Render List Mode ──────────────────────────────────────────────────

  const statusCounts = {
    all: assessments.length,
    'in-progress': assessments.filter((a) => a.status === 'in-progress').length,
    submitted: assessments.filter((a) => a.status === 'submitted').length,
    'qa-review': assessments.filter((a) => a.status === 'qa-review').length,
    approved: assessments.filter((a) => a.status === 'approved').length,
    rejected: assessments.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assessment Workspace</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage clinical assessments across all stages
              </p>
            </div>
            <Button onClick={() => (window.location.href = '/clinical-assessment-engine')}>
              <Plus className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[
            {
              label: 'In Progress',
              count: statusCounts['in-progress'],
              icon: Clock,
              color: 'blue',
            },
            {
              label: 'Submitted',
              count: statusCounts.submitted,
              icon: FileText,
              color: 'purple',
            },
            {
              label: 'QA Review',
              count: statusCounts['qa-review'],
              icon: Eye,
              color: 'yellow',
            },
            { label: 'Approved', count: statusCounts.approved, icon: CheckCircle, color: 'green' },
            { label: 'Rejected', count: statusCounts.rejected, icon: XCircle, color: 'red' },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setStatusFilter(stat.label.toLowerCase().replace(' ', '-'))}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
                  </div>
                  <div
                    className={`p-3 rounded-lg bg-${stat.color}-100`}
                    style={{
                      backgroundColor:
                        stat.color === 'blue'
                          ? '#DBEAFE'
                          : stat.color === 'purple'
                          ? '#F3E8FF'
                          : stat.color === 'yellow'
                          ? '#FEF3C7'
                          : stat.color === 'green'
                          ? '#D1FAE5'
                          : '#FEE2E2',
                    }}
                  >
                    <stat.icon
                      className="w-5 h-5"
                      style={{
                        color:
                          stat.color === 'blue'
                            ? '#2563EB'
                            : stat.color === 'purple'
                            ? '#9333EA'
                            : stat.color === 'yellow'
                            ? '#F59E0B'
                            : stat.color === 'green'
                            ? '#10B981'
                            : '#EF4444',
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters & Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by patient, clinician, or assessment type..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Statuses</option>
                  <option value="in-progress">In Progress</option>
                  <option value="submitted">Submitted</option>
                  <option value="qa-review">QA Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment List */}
        <Card>
          <CardHeader>
            <CardTitle>Assessments ({filteredAssessments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAssessments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No assessments found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {assessment.patientName}
                          </h4>
                          <Badge
                            variant={
                              assessment.status === 'approved'
                                ? 'default'
                                : assessment.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {assessment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Type:</span>{' '}
                            {assessment.type.replace(/-/g, ' ')}
                          </div>
                          <div>
                            <span className="font-medium">Clinician:</span>{' '}
                            {assessment.clinicianName}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>{' '}
                            {new Date(assessment.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Updated:</span>{' '}
                            {new Date(assessment.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {assessment.status === 'qa-review' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQAReview(assessment)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            QA Review
                          </Button>
                        )}
                        {(assessment.status === 'in-progress' ||
                          assessment.status === 'rejected') && (
                          <Button size="sm" variant="outline" onClick={() => handleEdit(assessment)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(assessment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
