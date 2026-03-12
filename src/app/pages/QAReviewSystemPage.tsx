/**
 * QA Review System Demo Page
 * 
 * Demonstrates the complete QA review system including:
 * - Correction Review Workflow
 * - QA Validation Panel
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import CorrectionReviewWorkflow, {
  generateMockCorrectedDocument,
  CorrectedDocument,
} from '../components/CorrectionReviewWorkflow';
import QAValidationPanel, {
  generateMockValidationResult,
  ValidationResult,
} from '../components/QAValidationPanel';
import type { IdentifiedIssue } from '../components/ReturnForCorrectionWorkflow';

export default function QAReviewSystemPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'correction' | 'validation'>('correction');
  const [mockCorrectedDoc] = useState<CorrectedDocument>(generateMockCorrectedDocument());
  const [mockValidation] = useState<ValidationResult>(generateMockValidationResult());

  const handleApprove = (comments: string) => {
    console.log('Approve corrected document:', comments);
    alert(`Document approved for billing!\n\nReview notes: ${comments || 'None'}`);
  };

  const handleReturnAgain = (reason: string, newIssues: IdentifiedIssue[]) => {
    console.log('Return document again:', reason, newIssues);
    alert(
      `Document returned again for correction.\n\nReason: ${reason}\n\nUnresolved issues: ${newIssues.length}`
    );
  };

  const handleFieldClick = (fieldId: string, sectionName: string) => {
    console.log('Navigate to field:', fieldId, sectionName);
    alert(`Navigate to field:\n\nField: ${fieldId}\nSection: ${sectionName}`);
  };

  const handleAutoFix = (issueId: string) => {
    console.log('Auto-fix issue:', issueId);
    alert(`Auto-fix applied for issue: ${issueId}`);
  };

  const handleRefresh = () => {
    console.log('Refresh validation');
    alert('Validation refreshed');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">QA Review System</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Correction review workflow & automated validation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* View Selector */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Select Demo View</h2>
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="correction">
                <RefreshCw className="w-4 h-4 mr-2" />
                Correction Review Workflow
              </TabsTrigger>
              <TabsTrigger value="validation">
                <CheckCircle className="w-4 h-4 mr-2" />
                QA Validation Panel
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Correction Review View */}
        {activeView === 'correction' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Correction Review Workflow
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Review corrected documents that were previously returned to clinicians. Compare
                original issues with clinician corrections, highlight changed fields, and make
                approval decisions.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <FeatureCard
                  title="Original Issues Display"
                  description="View all original issues with severity and instructions"
                  icon="📋"
                />
                <FeatureCard
                  title="Field Change Tracking"
                  description="Before/after comparison for all changed fields"
                  icon="🔄"
                />
                <FeatureCard
                  title="Issue Resolution Status"
                  description="Mark each issue as resolved, partial, or unresolved"
                  icon="✅"
                />
                <FeatureCard
                  title="Correction Timeline"
                  description="Visual timeline showing return and correction events"
                  icon="⏱️"
                />
                <FeatureCard
                  title="Re-Review Actions"
                  description="Approve for billing or return again with new issues"
                  icon="🎯"
                />
                <FeatureCard
                  title="Iteration Tracking"
                  description="Track multiple correction attempts and history"
                  icon="📈"
                />
              </div>
            </Card>

            <div className="h-[calc(100vh-400px)]">
              <CorrectionReviewWorkflow
                document={mockCorrectedDoc}
                currentReviewer="Jane Smith"
                onApprove={handleApprove}
                onReturnAgain={handleReturnAgain}
                onBack={() => navigate(-1)}
              />
            </div>
          </div>
        )}

        {/* Validation Panel View */}
        {activeView === 'validation' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                QA Validation Panel
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Automated validation panel displaying real-time compliance and quality checks.
                Each validation issue includes severity level, detailed description, and direct
                link to the affected field for quick correction.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                    7 Validation Categories
                  </h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Missing Required Fields</li>
                    <li>• Incomplete Assessments</li>
                    <li>• Unsigned Orders</li>
                    <li>• Frequency Mismatches</li>
                    <li>• Missing Physician Signatures</li>
                    <li>• Data Consistency</li>
                    <li>• Compliance Requirements</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 text-sm">
                    4 Severity Levels
                  </h3>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>
                      <strong>Critical:</strong> Blocks billing submission
                    </li>
                    <li>
                      <strong>Major:</strong> Significant compliance issue
                    </li>
                    <li>
                      <strong>Minor:</strong> Quality improvement opportunity
                    </li>
                    <li>
                      <strong>Warning:</strong> Informational alert
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FeatureCard
                  title="Auto-Detection"
                  description="Automatic validation of all document fields"
                  icon="🔍"
                />
                <FeatureCard
                  title="Clickable Links"
                  description="Direct navigation to affected fields"
                  icon="🔗"
                />
                <FeatureCard
                  title="Filtering"
                  description="Filter by severity or category"
                  icon="🎛️"
                />
                <FeatureCard
                  title="Compliance Score"
                  description="Overall document compliance percentage"
                  icon="📊"
                />
                <FeatureCard
                  title="Recommendations"
                  description="Specific guidance for each issue"
                  icon="💡"
                />
                <FeatureCard
                  title="Auto-Fix"
                  description="Automated fixes for certain issues"
                  icon="🔧"
                />
              </div>
            </Card>

            <QAValidationPanel
              validationResult={mockValidation}
              onFieldClick={handleFieldClick}
              onAutoFix={handleAutoFix}
              onRefresh={handleRefresh}
              mode="full"
            />

            {/* Compact Mode Demo */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Compact Mode Example</h3>
              <p className="text-sm text-gray-600 mb-4">
                The validation panel also supports a compact mode for use in sidebars or summary
                views.
              </p>
              <QAValidationPanel
                validationResult={mockValidation}
                onFieldClick={handleFieldClick}
                mode="compact"
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h4>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}
