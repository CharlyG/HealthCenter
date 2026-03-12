/**
 * OASIS SUMMARY VIEW
 * 
 * Comprehensive summary of completed OASIS assessment
 * Includes section completion, risk indicators, and readiness checks
 */

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  Send,
  Printer,
  TrendingUp,
  Activity,
  Heart,
  Brain,
  Users,
} from 'lucide-react';
import type { OasisAssessment, OasisSection } from '../../types/oasis';
import { OASIS_TIMEPOINT_CONFIG } from '../../types/oasis';

interface OasisSummaryViewProps {
  assessment: OasisAssessment;
  sections: OasisSection[];
  onEdit?: () => void;
  onSign?: () => void;
  onSubmitQA?: () => void;
  onPrint?: () => void;
}

export function OasisSummaryView({
  assessment,
  sections,
  onEdit,
  onSign,
  onSubmitQA,
  onPrint,
}: OasisSummaryViewProps) {
  const timepointConfig = OASIS_TIMEPOINT_CONFIG[assessment.timepoint];

  // Calculate metrics
  const completedSections = sections.filter((s) => s.isComplete).length;
  const sectionsWithErrors = sections.filter((s) => s.validationErrors > 0).length;
  const sectionsWithWarnings = sections.filter((s) => s.validationWarnings > 0).length;
  const totalErrors = sections.reduce((sum, s) => sum + s.validationErrors, 0);
  const totalWarnings = sections.reduce((sum, s) => sum + s.validationWarnings, 0);

  // Risk indicators (mock - would come from actual OASIS data)
  const riskIndicators = [
    {
      id: 'fall-risk',
      label: 'Fall Risk',
      value: 'High',
      severity: 'critical' as const,
      icon: AlertTriangle,
      color: 'red',
    },
    {
      id: 'hospitalization-risk',
      label: 'Hospitalization Risk',
      value: 'Moderate',
      severity: 'warning' as const,
      icon: Activity,
      color: 'amber',
    },
    {
      id: 'pressure-injury',
      label: 'Pressure Injury Risk',
      value: 'Low',
      severity: 'info' as const,
      icon: Heart,
      color: 'green',
    },
    {
      id: 'cognitive-function',
      label: 'Cognitive Function',
      value: 'Alert & Oriented',
      severity: 'info' as const,
      icon: Brain,
      color: 'green',
    },
  ];

  const isReadyForSignature = assessment.percentComplete === 100 && assessment.isValid;
  const isReadyForQA = assessment.signature !== undefined;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">OASIS Summary</h1>
            <Badge className={`bg-${timepointConfig.color}-100 text-${timepointConfig.color}-700`}>
              {timepointConfig.shortLabel}
            </Badge>
          </div>
          <p className="text-gray-600">
            {assessment.patientName} • {assessment.patientId} • {' '}
            {new Date(assessment.assessmentDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onPrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Summary
          </Button>
          <Button variant="outline" onClick={onEdit}>
            Edit Assessment
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessment Status</h2>
        <div className="grid grid-cols-4 gap-4">
          <StatusMetric
            label="Completion"
            value={`${assessment.percentComplete}%`}
            icon={TrendingUp}
            color={assessment.percentComplete === 100 ? 'green' : 'blue'}
          />
          <StatusMetric
            label="Sections Complete"
            value={`${completedSections}/${sections.length}`}
            icon={FileCheck}
            color={completedSections === sections.length ? 'green' : 'blue'}
          />
          <StatusMetric
            label="Validation Errors"
            value={totalErrors.toString()}
            icon={AlertCircle}
            color={totalErrors === 0 ? 'green' : 'red'}
          />
          <StatusMetric
            label="Warnings"
            value={totalWarnings.toString()}
            icon={AlertTriangle}
            color={totalWarnings === 0 ? 'green' : 'amber'}
          />
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span className="font-medium">{assessment.percentComplete}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                assessment.percentComplete === 100 ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${assessment.percentComplete}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Section Completion Overview */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Completion</h2>
        <div className="grid grid-cols-2 gap-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`p-4 border rounded-lg ${
                section.validationErrors > 0
                  ? 'border-red-200 bg-red-50'
                  : section.validationWarnings > 0
                  ? 'border-amber-200 bg-amber-50'
                  : section.isComplete
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {section.isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : section.validationErrors > 0 ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600">{section.mItemRange}</p>
                  <div className="mt-2 text-xs text-gray-700">
                    {section.completedItems} of {section.itemCount} items
                  </div>
                </div>
                {section.validationErrors > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                    {section.validationErrors} error{section.validationErrors !== 1 ? 's' : ''}
                  </Badge>
                )}
                {section.validationWarnings > 0 && section.validationErrors === 0 && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                    {section.validationWarnings} warning{section.validationWarnings !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Risk Indicators */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Risk Indicators</h2>
        <div className="grid grid-cols-2 gap-4">
          {riskIndicators.map((indicator) => {
            const Icon = indicator.icon;
            const colorClasses = {
              red: 'bg-red-100 text-red-700 border-red-200',
              amber: 'bg-amber-100 text-amber-700 border-amber-200',
              green: 'bg-green-100 text-green-700 border-green-200',
            };

            return (
              <div
                key={indicator.id}
                className={`p-4 border rounded-lg ${colorClasses[indicator.color]}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[indicator.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{indicator.label}</p>
                    <p className="text-lg font-bold">{indicator.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Readiness Checks */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflow Readiness</h2>
        <div className="space-y-3">
          <ReadinessCheck
            label="Ready for Signature"
            status={isReadyForSignature}
            description={
              isReadyForSignature
                ? 'All required items complete and validated'
                : 'Complete all required items and resolve validation errors'
            }
            action={
              isReadyForSignature && !assessment.signature ? (
                <Button size="sm" onClick={onSign} className="bg-green-600 hover:bg-green-700">
                  <FileCheck className="w-3 h-3 mr-1" />
                  Sign Now
                </Button>
              ) : assessment.signature ? (
                <Badge className="bg-green-100 text-green-700">Signed</Badge>
              ) : null
            }
          />

          <ReadinessCheck
            label="Ready for QA Review"
            status={isReadyForQA}
            description={
              isReadyForQA
                ? 'Assessment is signed and ready for QA review'
                : 'Requires clinician signature before QA submission'
            }
            action={
              isReadyForQA && assessment.status !== 'pending-qa' && assessment.status !== 'qa-approved' ? (
                <Button size="sm" onClick={onSubmitQA} className="bg-purple-600 hover:bg-purple-700">
                  <Send className="w-3 h-3 mr-1" />
                  Submit to QA
                </Button>
              ) : assessment.status === 'pending-qa' ? (
                <Badge className="bg-purple-100 text-purple-700">In QA Queue</Badge>
              ) : assessment.status === 'qa-approved' ? (
                <Badge className="bg-green-100 text-green-700">QA Approved</Badge>
              ) : null
            }
          />

          <ReadinessCheck
            label="Ready for Transmission"
            status={assessment.status === 'qa-approved'}
            description={
              assessment.status === 'qa-approved'
                ? 'Assessment approved and ready to transmit to CMS'
                : 'Requires QA approval before transmission'
            }
            action={
              assessment.transmittedAt ? (
                <Badge className="bg-blue-100 text-blue-700">Transmitted</Badge>
              ) : null
            }
          />
        </div>
      </Card>

      {/* Signature Information */}
      {assessment.signature && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Signature Information</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Signed By</p>
              <p className="font-medium text-gray-900 mt-1">{assessment.signature.signedBy}</p>
            </div>
            <div>
              <p className="text-gray-600">Credentials</p>
              <p className="font-medium text-gray-900 mt-1">
                {assessment.signature.signedByCredentials}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Signed At</p>
              <p className="font-medium text-gray-900 mt-1">
                {new Date(assessment.signature.signedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusMetric({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function ReadinessCheck({
  label,
  status,
  description,
  action,
}: {
  label: string;
  status: boolean;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-start gap-3 flex-1">
        {status ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className="font-semibold text-gray-900">{label}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-3">{action}</div>}
    </div>
  );
}
