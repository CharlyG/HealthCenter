/**
 * QA Review Panel Component
 * Interface for QA specialists to review and approve/reject clinical assessments
 */

import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import type { AssessmentInstance, AssessmentDefinition } from './types';

interface QAIssue {
  sectionId: string;
  questionId: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
}

interface QAReviewPanelProps {
  assessment: AssessmentInstance;
  definition: AssessmentDefinition;
  onApprove: (comments?: string) => Promise<void>;
  onReject: (comments: string, issues: QAIssue[]) => Promise<void>;
  onClose: () => void;
}

export function QAReviewPanel({
  assessment,
  definition,
  onApprove,
  onReject,
  onClose,
}: QAReviewPanelProps) {
  const [mode, setMode] = useState<'review' | 'approve' | 'reject'>('review');
  const [comments, setComments] = useState('');
  const [issues, setIssues] = useState<QAIssue[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate completion percentage
  const totalQuestions = definition.sections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );
  const answeredQuestions = Object.keys(assessment.data).length;
  const completionPercent = Math.round((answeredQuestions / totalQuestions) * 100);

  // ─── Add Issue ─────────────────────────────────────────────────────────

  const addIssue = (sectionId: string, questionId: string) => {
    const section = definition.sections.find((s) => s.id === sectionId);
    const question = section?.questions.find((q) => q.id === questionId);

    if (!question) return;

    const newIssue: QAIssue = {
      sectionId,
      questionId,
      issue: `Issue with: ${question.label}`,
      severity: 'warning',
    };

    setIssues([...issues, newIssue]);
  };

  const removeIssue = (index: number) => {
    setIssues(issues.filter((_, i) => i !== index));
  };

  const updateIssue = (index: number, updates: Partial<QAIssue>) => {
    setIssues(issues.map((issue, i) => (i === index ? { ...issue, ...updates } : issue)));
  };

  // ─── Handle Actions ────────────────────────────────────────────────────

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(comments || undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      alert('Please provide rejection comments');
      return;
    }

    setLoading(true);
    try {
      await onReject(comments, issues);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render Review Mode ────────────────────────────────────────────────

  if (mode === 'review') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">QA Review</h1>
                    <p className="text-sm text-gray-600">{definition.title}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button variant="outline" className="text-red-600" onClick={() => setMode('reject')}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => setMode('approve')}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Review Area */}
            <div className="col-span-2 space-y-6">
              {/* Assessment Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Patient</p>
                      <p className="text-sm font-medium text-gray-900">{assessment.patientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Clinician</p>
                      <p className="text-sm font-medium text-gray-900">{assessment.clinicianName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Submitted</p>
                      <p className="text-sm font-medium text-gray-900">
                        {assessment.submittedAt
                          ? new Date(assessment.submittedAt).toLocaleDateString('en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            } as any)
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <Badge>{assessment.status}</Badge>
                    </div>
                  </div>

                  {/* Completion Progress */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Completion</span>
                      <span className="text-sm font-semibold text-gray-900">{completionPercent}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all duration-300"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {answeredQuestions} of {totalQuestions} questions answered
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section-by-Section Review */}
              {definition.sections.map((section) => {
                const sectionAnswers = section.questions.filter((q) => assessment.data[q.id]);
                const sectionComplete = sectionAnswers.length === section.questions.length;

                return (
                  <Card key={section.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{section.title}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        </div>
                        {sectionComplete ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {section.questions.map((question) => {
                          const answer = assessment.data[question.id];
                          const hasAnswer = answer !== undefined && answer !== null && answer !== '';

                          return (
                            <div
                              key={question.id}
                              className={`p-3 rounded-lg border ${
                                hasAnswer
                                  ? 'bg-white border-gray-200'
                                  : 'bg-yellow-50 border-yellow-200'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {question.label}
                                    {question.required && (
                                      <span className="text-red-500 ml-1">*</span>
                                    )}
                                  </p>
                                  {hasAnswer ? (
                                    <p className="text-sm text-gray-700 mt-1">
                                      <strong>Answer:</strong>{' '}
                                      {typeof answer === 'object'
                                        ? JSON.stringify(answer)
                                        : String(answer)}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-yellow-700 mt-1">No answer provided</p>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addIssue(section.id, question.id)}
                                >
                                  Flag Issue
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Sidebar - Issues & Notes */}
            <div className="space-y-6">
              {/* QA Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">QA Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      'All required fields completed',
                      'Clinical data is accurate',
                      'Measurements within normal ranges',
                      'Signature present',
                      'No duplicate entries',
                      'Proper documentation standards',
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span className="text-gray-700">{item}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Flagged Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Flagged Issues ({issues.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {issues.length === 0 ? (
                    <p className="text-sm text-gray-500">No issues flagged</p>
                  ) : (
                    <div className="space-y-2">
                      {issues.map((issue, idx) => (
                        <div key={idx} className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-start justify-between mb-1">
                            <Badge
                              variant={
                                issue.severity === 'critical'
                                  ? 'destructive'
                                  : issue.severity === 'warning'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {issue.severity}
                            </Badge>
                            <button
                              onClick={() => removeIssue(idx)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-700">{issue.issue}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reviewer Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reviewer Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add internal notes about this review..."
                    rows={6}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Approve Mode ───────────────────────────────────────────────

  if (mode === 'approve') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Approve Assessment</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Confirm approval of {definition.title}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                By approving this assessment, you confirm that all required fields are complete and
                accurate, and the documentation meets agency standards.
              </p>
            </div>

            <div>
              <Label>Approval Comments (Optional)</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments about this approval..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setMode('review')} disabled={loading}>
                Back to Review
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? 'Approving...' : 'Confirm Approval'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Render Reject Mode ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle>Reject Assessment</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Provide detailed feedback for {definition.title}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-900">
              <strong>Important:</strong> When rejecting an assessment, you must provide specific
              reasons and corrective actions required. The assessment will be returned to the clinician
              for revision.
            </p>
          </div>

          <div>
            <Label>
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Clearly describe the issues that require correction..."
              rows={6}
              className="mt-1"
            />
          </div>

          {/* Issues Summary */}
          {issues.length > 0 && (
            <div>
              <Label>Flagged Issues ({issues.length})</Label>
              <div className="mt-2 space-y-2">
                {issues.map((issue, idx) => (
                  <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant={
                          issue.severity === 'critical'
                            ? 'destructive'
                            : issue.severity === 'warning'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {issue.severity}
                      </Badge>
                      <button
                        onClick={() => removeIssue(idx)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <Textarea
                      value={issue.issue}
                      onChange={(e) => updateIssue(idx, { issue: e.target.value })}
                      placeholder="Describe the issue..."
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => setMode('review')} disabled={loading}>
              Back to Review
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading || !comments.trim()}
            >
              {loading ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
