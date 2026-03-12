/**
 * Assessment Submission Workflow
 * 
 * Complete submission process for clinical assessments:
 * 
 * WORKFLOW STAGES:
 * 1. Pre-Submission Validation
 *    - Run comprehensive validation checks
 *    - Display all errors and warnings
 *    - Show completion status by section
 * 
 * 2. Review & Fix
 *    - Review all responses
 *    - Navigate to errors with one click
 *    - Fix validation errors
 *    - Re-validate after fixes
 * 
 * 3. Final Review
 *    - Confirm all data is correct
 *    - Review submission checklist
 *    - Acknowledge submission implications
 * 
 * 4. Submit
 *    - Submit to CMS/payer
 *    - Lock assessment (read-only)
 *    - Generate confirmation
 * 
 * 5. Post-Submission
 *    - Display success message
 *    - Show submission details
 *    - Provide next actions
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Send,
  Lock,
  Eye,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Clock,
  User,
  Calendar,
  ExternalLink,
  Download,
  RefreshCw,
  Loader2,
  XCircle,
  Check,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ValidationSeverity = 'error' | 'warning' | 'info';
type SubmissionStage = 'validation' | 'review' | 'confirmation' | 'submitting' | 'success' | 'error';

interface ValidationIssue {
  id: string;
  section: string;
  field: string;
  fieldLabel: string;
  severity: ValidationSeverity;
  message: string;
  suggestedFix?: string;
  cmsCode?: string;
}

interface SectionValidation {
  sectionId: string;
  sectionTitle: string;
  totalFields: number;
  completedFields: number;
  errors: number;
  warnings: number;
  percentage: number;
}

interface SubmissionResult {
  success: boolean;
  submissionId?: string;
  timestamp?: string;
  message?: string;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

const MOCK_VALIDATION_ISSUES: ValidationIssue[] = [
  {
    id: 'err-001',
    section: 'Patient Demographics',
    field: 'medicareNumber',
    fieldLabel: 'Medicare Number',
    severity: 'error',
    message: 'Medicare number is required for CMS submission',
    suggestedFix: 'Enter patient Medicare number',
  },
  {
    id: 'err-002',
    section: 'Functional Status',
    field: 'bathing',
    fieldLabel: 'Bathing (M1830)',
    severity: 'error',
    message: 'Response is required for CMS submission',
    cmsCode: 'M1830',
    suggestedFix: 'Select appropriate bathing status',
  },
  {
    id: 'warn-001',
    section: 'Medications',
    field: 'medicationCount',
    fieldLabel: 'Number of Medications',
    severity: 'warning',
    message: 'Patient is taking 12+ medications - consider medication reconciliation',
    suggestedFix: 'Review with physician for potential deprescribing',
  },
  {
    id: 'warn-002',
    section: 'Functional Status',
    field: 'fallRisk',
    fieldLabel: 'Fall Risk Assessment',
    severity: 'warning',
    message: 'High fall risk indicated - ensure fall prevention plan is documented',
    suggestedFix: 'Document fall prevention interventions in care plan',
  },
  {
    id: 'info-001',
    section: 'Healthcare Utilization',
    field: 'hospitalizations',
    fieldLabel: 'Recent Hospitalizations',
    severity: 'info',
    message: '2+ hospitalizations in 60 days may indicate need for care plan adjustment',
  },
];

const MOCK_SECTION_VALIDATION: SectionValidation[] = [
  {
    sectionId: 'demographics',
    sectionTitle: 'Patient Demographics',
    totalFields: 8,
    completedFields: 7,
    errors: 1,
    warnings: 0,
    percentage: 88,
  },
  {
    sectionId: 'living',
    sectionTitle: 'Living Arrangements',
    totalFields: 4,
    completedFields: 4,
    errors: 0,
    warnings: 0,
    percentage: 100,
  },
  {
    sectionId: 'functional',
    sectionTitle: 'Functional Status',
    totalFields: 8,
    completedFields: 7,
    errors: 1,
    warnings: 1,
    percentage: 88,
  },
  {
    sectionId: 'cognitive',
    sectionTitle: 'Cognitive Status',
    totalFields: 5,
    completedFields: 5,
    errors: 0,
    warnings: 0,
    percentage: 100,
  },
  {
    sectionId: 'medications',
    sectionTitle: 'Medications',
    totalFields: 4,
    completedFields: 4,
    errors: 0,
    warnings: 1,
    percentage: 100,
  },
  {
    sectionId: 'utilization',
    sectionTitle: 'Healthcare Utilization',
    totalFields: 3,
    completedFields: 3,
    errors: 0,
    warnings: 0,
    percentage: 100,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AssessmentSubmissionWorkflow() {
  const navigate = useNavigate();
  
  const [stage, setStage] = useState<SubmissionStage>('validation');
  const [validationIssues, setValidationIssues] = useState(MOCK_VALIDATION_ISSUES);
  const [sectionValidation, setSectionValidation] = useState(MOCK_SECTION_VALIDATION);
  const [isValidating, setIsValidating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [acknowledgeReadOnly, setAcknowledgeReadOnly] = useState(false);
  const [acknowledgeCMSSubmission, setAcknowledgeCMSSubmission] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Calculate overall status
  const validationSummary = useMemo(() => {
    const errors = validationIssues.filter(i => i.severity === 'error').length;
    const warnings = validationIssues.filter(i => i.severity === 'warning').length;
    const info = validationIssues.filter(i => i.severity === 'info').length;
    
    const totalFields = sectionValidation.reduce((sum, s) => sum + s.totalFields, 0);
    const completedFields = sectionValidation.reduce((sum, s) => sum + s.completedFields, 0);
    const overallPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    
    const canSubmit = errors === 0;
    
    return { errors, warnings, info, totalFields, completedFields, overallPercentage, canSubmit };
  }, [validationIssues, sectionValidation]);

  const handleRevalidate = async () => {
    setIsValidating(true);
    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate fixing some errors
    const updatedIssues = validationIssues.filter(issue => 
      Math.random() > 0.5 // Randomly "fix" some issues
    );
    setValidationIssues(updatedIssues);
    setIsValidating(false);
  };

  const handleProceedToReview = () => {
    if (validationSummary.canSubmit) {
      setStage('review');
    }
  };

  const handleProceedToConfirmation = () => {
    setShowConfirmDialog(true);
  };

  const handleSubmit = async () => {
    setShowConfirmDialog(false);
    setStage('submitting');

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success
    const result: SubmissionResult = {
      success: true,
      submissionId: 'SUB-' + Date.now(),
      timestamp: new Date().toISOString(),
      message: 'Assessment successfully submitted to CMS',
    };

    setSubmissionResult(result);
    setStage('success');
  };

  const handleNavigateToField = (issue: ValidationIssue) => {
    // Navigate back to editor with field focused
    navigate(`/oasis-assessment-editor?section=${issue.section}&field=${issue.field}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                disabled={stage === 'submitting'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Editor
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Submit Assessment</h1>
                <p className="text-sm text-gray-600 mt-1">
                  OASIS-E Start of Care • Margaret Johnson • MRN-334455
                </p>
              </div>
            </div>

            {/* Stage Indicator */}
            <div className="flex items-center gap-2">
              <SubmissionStageBadge 
                current={stage} 
                stage="validation" 
                label="Validation" 
              />
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <SubmissionStageBadge 
                current={stage} 
                stage="review" 
                label="Review" 
              />
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <SubmissionStageBadge 
                current={stage} 
                stage="confirmation" 
                label="Submit" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {stage === 'validation' && (
          <ValidationStage
            validationSummary={validationSummary}
            validationIssues={validationIssues}
            sectionValidation={sectionValidation}
            isValidating={isValidating}
            onRevalidate={handleRevalidate}
            onNavigateToField={handleNavigateToField}
            onProceed={handleProceedToReview}
          />
        )}

        {stage === 'review' && (
          <ReviewStage
            validationSummary={validationSummary}
            sectionValidation={sectionValidation}
            onBack={() => setStage('validation')}
            onProceed={handleProceedToConfirmation}
          />
        )}

        {stage === 'submitting' && (
          <SubmittingStage />
        )}

        {stage === 'success' && submissionResult && (
          <SuccessStage
            result={submissionResult}
            onViewAssessment={() => navigate('/clinical-assessment-viewer')}
            onBackToWorkspace={() => navigate('/assessment-workspace')}
          />
        )}

        {stage === 'error' && submissionResult && (
          <ErrorStage
            result={submissionResult}
            onRetry={() => setStage('review')}
            onCancel={() => navigate(-1)}
          />
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Send className="w-6 h-6 text-blue-600" />
              Submit Assessment to CMS?
            </DialogTitle>
            <DialogDescription>
              Please review and confirm the following before submission:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Summary */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Submission Details</p>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Assessment Type: OASIS-E Start of Care</li>
                    <li>• Patient: Margaret Johnson (MRN-334455)</li>
                    <li>• Submission Date: {new Date().toLocaleDateString()}</li>
                    <li>• Destination: CMS OASIS Repository</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Validation Status */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">Completion</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {validationSummary.overallPercentage}%
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-gray-600">Errors</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {validationSummary.errors}
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-gray-600">Warnings</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {validationSummary.warnings}
                </div>
              </Card>
            </div>

            <Separator />

            {/* Acknowledgements */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="ack-readonly" 
                  checked={acknowledgeReadOnly}
                  onCheckedChange={(checked) => setAcknowledgeReadOnly(checked === true)}
                />
                <label 
                  htmlFor="ack-readonly" 
                  className="text-sm text-gray-700 cursor-pointer flex-1"
                >
                  I understand that <strong>this assessment will become read-only</strong> after submission 
                  and cannot be edited without creating an addendum or correction.
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox 
                  id="ack-cms" 
                  checked={acknowledgeCMSSubmission}
                  onCheckedChange={(checked) => setAcknowledgeCMSSubmission(checked === true)}
                />
                <label 
                  htmlFor="ack-cms" 
                  className="text-sm text-gray-700 cursor-pointer flex-1"
                >
                  I confirm that all information is accurate and complete to the best of my knowledge, 
                  and I am authorized to submit this assessment to CMS.
                </label>
              </div>
            </div>

            {/* Warning */}
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-medium mb-1">Important Notice</p>
                  <p className="text-amber-800">
                    Once submitted, this assessment will be locked and sent to CMS. 
                    Any changes will require an official addendum or correction process.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!acknowledgeReadOnly || !acknowledgeCMSSubmission}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit to CMS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION STAGE
// ═══════════════════════════════════════════════════════════════════════════

interface ValidationStageProps {
  validationSummary: any;
  validationIssues: ValidationIssue[];
  sectionValidation: SectionValidation[];
  isValidating: boolean;
  onRevalidate: () => void;
  onNavigateToField: (issue: ValidationIssue) => void;
  onProceed: () => void;
}

function ValidationStage({
  validationSummary,
  validationIssues,
  sectionValidation,
  isValidating,
  onRevalidate,
  onNavigateToField,
  onProceed,
}: ValidationStageProps) {
  const errors = validationIssues.filter(i => i.severity === 'error');
  const warnings = validationIssues.filter(i => i.severity === 'warning');
  const info = validationIssues.filter(i => i.severity === 'info');

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Validation Summary</h2>
            <p className="text-sm text-gray-600">
              Review all validation issues before submitting to CMS
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={onRevalidate}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-validate
              </>
            )}
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {validationSummary.overallPercentage}%
                </div>
                <div className="text-xs text-blue-700">Complete</div>
              </div>
            </div>
          </Card>

          <Card className={cn(
            'p-4',
            errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                errors.length > 0 ? 'bg-red-100' : 'bg-green-100'
              )}>
                {errors.length > 0 ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div>
                <div className={cn(
                  'text-2xl font-bold',
                  errors.length > 0 ? 'text-red-900' : 'text-green-900'
                )}>
                  {errors.length}
                </div>
                <div className={cn(
                  'text-xs',
                  errors.length > 0 ? 'text-red-700' : 'text-green-700'
                )}>
                  Errors
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-900">
                  {warnings.length}
                </div>
                <div className="text-xs text-amber-700">Warnings</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gray-50 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Info className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {info.length}
                </div>
                <div className="text-xs text-gray-700">Info</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Cannot Submit Warning */}
        {!validationSummary.canSubmit && (
          <Card className="p-4 bg-red-50 border-red-200 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900 mb-1">
                  Cannot Submit - Errors Must Be Fixed
                </p>
                <p className="text-sm text-red-800">
                  You must fix all {errors.length} error{errors.length !== 1 ? 's' : ''} before submitting 
                  this assessment to CMS. Click on any error below to navigate to the field and fix it.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Can Submit Info */}
        {validationSummary.canSubmit && (
          <Card className="p-4 bg-green-50 border-green-200 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900 mb-1">
                  Ready to Submit
                </p>
                <p className="text-sm text-green-800">
                  All required fields are complete with no errors. 
                  {warnings.length > 0 && ` There ${warnings.length === 1 ? 'is' : 'are'} ${warnings.length} warning${warnings.length !== 1 ? 's' : ''} that should be reviewed but do not prevent submission.`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Progress by Section */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Progress by Section</h3>
          <div className="space-y-3">
            {sectionValidation.map(section => (
              <SectionValidationCard key={section.sectionId} section={section} />
            ))}
          </div>
        </div>
      </Card>

      {/* Issues List */}
      {validationIssues.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Validation Issues</h3>
          
          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-red-900">
                  Errors ({errors.length})
                </h4>
              </div>
              <div className="space-y-2">
                {errors.map(issue => (
                  <ValidationIssueCard 
                    key={issue.id} 
                    issue={issue}
                    onNavigate={onNavigateToField}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-medium text-amber-900">
                  Warnings ({warnings.length})
                </h4>
              </div>
              <div className="space-y-2">
                {warnings.map(issue => (
                  <ValidationIssueCard 
                    key={issue.id} 
                    issue={issue}
                    onNavigate={onNavigateToField}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          {info.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">
                  Information ({info.length})
                </h4>
              </div>
              <div className="space-y-2">
                {info.map(issue => (
                  <ValidationIssueCard 
                    key={issue.id} 
                    issue={issue}
                    onNavigate={onNavigateToField}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Back to Editor
        </Button>
        <Button 
          onClick={onProceed}
          disabled={!validationSummary.canSubmit}
        >
          Proceed to Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEW STAGE
// ═══════════════════════════════════════════════════════════════════════════

interface ReviewStageProps {
  validationSummary: any;
  sectionValidation: SectionValidation[];
  onBack: () => void;
  onProceed: () => void;
}

function ReviewStage({ validationSummary, sectionValidation, onBack, onProceed }: ReviewStageProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Final Review</h2>
        <p className="text-sm text-gray-600 mb-6">
          Review your assessment responses before submission
        </p>

        {/* Completion Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-700 mb-1">Overall Completion</div>
            <div className="text-2xl font-bold text-blue-900">
              {validationSummary.overallPercentage}%
            </div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-sm text-green-700 mb-1">Fields Completed</div>
            <div className="text-2xl font-bold text-green-900">
              {validationSummary.completedFields}/{validationSummary.totalFields}
            </div>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="text-sm text-purple-700 mb-1">Sections Complete</div>
            <div className="text-2xl font-bold text-purple-900">
              {sectionValidation.filter(s => s.percentage === 100).length}/{sectionValidation.length}
            </div>
          </Card>
        </div>

        {/* Section Summary */}
        <div className="space-y-3">
          {sectionValidation.map(section => (
            <Card key={section.sectionId} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{section.sectionTitle}</h4>
                <Badge variant={section.percentage === 100 ? 'default' : 'outline'}>
                  {section.completedFields}/{section.totalFields} fields
                </Badge>
              </div>
              <Progress value={section.percentage} className="h-2" />
            </Card>
          ))}
        </div>
      </Card>

      {/* Pre-Submission Checklist */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Pre-Submission Checklist</h3>
        <div className="space-y-3">
          <ChecklistItem
            checked={validationSummary.errors === 0}
            label="All required fields are completed"
          />
          <ChecklistItem
            checked={validationSummary.errors === 0}
            label="No validation errors"
          />
          <ChecklistItem
            checked={true}
            label="Patient demographics verified"
          />
          <ChecklistItem
            checked={true}
            label="Clinical responses reviewed for accuracy"
          />
          <ChecklistItem
            checked={true}
            label="CMS codes properly documented"
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Validation
        </Button>
        <Button onClick={onProceed}>
          <Send className="w-4 h-4 mr-2" />
          Submit Assessment
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBMITTING STAGE
// ═══════════════════════════════════════════════════════════════════════════

function SubmittingStage() {
  return (
    <Card className="p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Submitting Assessment...
        </h2>
        <p className="text-gray-600 mb-4">
          Please wait while we submit your assessment to CMS
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Validating final data</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Transmitting to CMS...</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Awaiting confirmation</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUCCESS STAGE
// ═══════════════════════════════════════════════════════════════════════════

interface SuccessStageProps {
  result: SubmissionResult;
  onViewAssessment: () => void;
  onBackToWorkspace: () => void;
}

function SuccessStage({ result, onViewAssessment, onBackToWorkspace }: SuccessStageProps) {
  return (
    <div className="space-y-6">
      <Card className="p-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Assessment Successfully Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            {result.message || 'Your OASIS-E assessment has been submitted to CMS'}
          </p>

          {/* Submission Details */}
          <Card className="p-6 bg-gray-50 text-left mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Submission ID</div>
                <div className="font-mono text-sm font-medium text-gray-900">
                  {result.submissionId}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Submitted At</div>
                <div className="text-sm font-medium text-gray-900">
                  {result.timestamp && new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Status</div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Submitted
                </Badge>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Assessment Lock</div>
                <Badge variant="outline">
                  <Lock className="w-3 h-3 mr-1" />
                  Read-Only
                </Badge>
              </div>
            </div>
          </Card>

          {/* Important Notice */}
          <Card className="p-4 bg-blue-50 border-blue-200 text-left mb-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Assessment is Now Read-Only</p>
                <p className="text-blue-800">
                  This assessment has been locked and can no longer be edited. 
                  If changes are needed, you must create an official addendum or correction.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onViewAssessment}>
              <Eye className="w-4 h-4 mr-2" />
              View Assessment
            </Button>
            <Button onClick={onBackToWorkspace}>
              Back to Workspace
            </Button>
          </div>
        </div>
      </Card>

      {/* Next Steps */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Track Submission Status</p>
              <p className="text-sm text-gray-600">
                Monitor CMS processing status in the Assessment Workspace
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <Download className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Download Submission Receipt</p>
              <p className="text-sm text-gray-600">
                Keep a copy of the submission confirmation for your records
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Review Care Plan</p>
              <p className="text-sm text-gray-600">
                Update patient care plan based on assessment findings
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ERROR STAGE
// ═══════════════════════════════════════════════════════════════════════════

interface ErrorStageProps {
  result: SubmissionResult;
  onRetry: () => void;
  onCancel: () => void;
}

function ErrorStage({ result, onRetry, onCancel }: ErrorStageProps) {
  return (
    <Card className="p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Submission Failed
        </h2>
        <p className="text-gray-600 mb-6">
          {result.error || 'There was an error submitting your assessment to CMS'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function SubmissionStageBadge({ 
  current, 
  stage, 
  label 
}: { 
  current: SubmissionStage; 
  stage: SubmissionStage; 
  label: string;
}) {
  const isActive = current === stage;
  const isComplete = 
    (stage === 'validation' && ['review', 'confirmation', 'submitting', 'success'].includes(current)) ||
    (stage === 'review' && ['confirmation', 'submitting', 'success'].includes(current));

  return (
    <Badge 
      variant={isActive ? 'default' : 'outline'}
      className={cn(
        'text-xs',
        isComplete && 'bg-green-100 text-green-800 border-green-300'
      )}
    >
      {isComplete && <CheckCircle2 className="w-3 h-3 mr-1" />}
      {label}
    </Badge>
  );
}

function SectionValidationCard({ section }: { section: SectionValidation }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            section.errors > 0 ? 'bg-red-100' : 
            section.percentage === 100 ? 'bg-green-100' : 'bg-gray-100'
          )}>
            {section.errors > 0 ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : section.percentage === 100 ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-gray-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900 mb-1">{section.sectionTitle}</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{section.completedFields}/{section.totalFields} fields</span>
              {section.errors > 0 && (
                <>
                  <span>•</span>
                  <span className="text-red-600">{section.errors} error{section.errors !== 1 ? 's' : ''}</span>
                </>
              )}
              {section.warnings > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-600">{section.warnings} warning{section.warnings !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm font-semibold text-gray-900">
          {section.percentage}%
        </div>
      </div>
      <Progress value={section.percentage} className="h-1.5" />
    </Card>
  );
}

function ValidationIssueCard({ 
  issue, 
  onNavigate 
}: { 
  issue: ValidationIssue;
  onNavigate: (issue: ValidationIssue) => void;
}) {
  const config = {
    error: { 
      icon: XCircle, 
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      textColor: 'text-red-900'
    },
    warning: { 
      icon: AlertTriangle, 
      bgColor: 'bg-amber-50', 
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900'
    },
    info: { 
      icon: Info, 
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[issue.severity];

  return (
    <Card className={cn('p-4 border-l-4', bgColor, borderColor)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className={cn('font-medium mb-1', textColor)}>
                {issue.fieldLabel}
                {issue.cmsCode && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {issue.cmsCode}
                  </Badge>
                )}
              </p>
              <p className="text-xs text-gray-600">
                Section: {issue.section}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            {issue.message}
          </p>
          {issue.suggestedFix && (
            <p className="text-sm text-gray-600 italic mb-3">
              Suggestion: {issue.suggestedFix}
            </p>
          )}
          {issue.severity === 'error' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate(issue)}
            >
              <Edit3 className="w-3 h-3 mr-2" />
              Fix This Error
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ChecklistItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center',
        checked ? 'bg-green-100' : 'bg-gray-100'
      )}>
        {checked ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <X className="w-3 h-3 text-gray-400" />
        )}
      </div>
      <span className={cn(
        'text-sm',
        checked ? 'text-gray-900' : 'text-gray-600'
      )}>
        {label}
      </span>
    </div>
  );
}
