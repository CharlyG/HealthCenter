/**
 * SN Review Summary
 * Comprehensive review view of completed SN assessment
 */

import React from 'react';
import { Calendar, User, AlertTriangle, Activity, Heart, Shield, FileText, CheckCircle, Clock } from 'lucide-react';
import type { SNAssessment } from '../../data/snAssessmentGateway';

interface SNReviewSummaryProps {
  assessment: SNAssessment;
  onEdit?: () => void;
  onSign?: () => void;
}

export function SNReviewSummary({ assessment, onEdit, onSign }: SNReviewSummaryProps) {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assessment.patientName}</h1>
              <p className="text-gray-600 mt-1">
                Skilled Nursing Assessment - {assessment.visitType?.charAt(0).toUpperCase() + assessment.visitType?.slice(1)} Visit
              </p>
            </div>
            <div className="flex items-center gap-2">
              {assessment.status === 'completed' && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </span>
              )}
              {assessment.status === 'pending_review' && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Pending Review
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(assessment.visitDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4" />
              <span>{assessment.nurseName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span>ID: {assessment.id}</span>
            </div>
          </div>
        </div>

        {/* Risk Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Summary</h2>
          <div className="grid grid-cols-5 gap-3">
            <RiskBadge
              icon={AlertTriangle}
              label="Fall Risk"
              active={assessment.riskFlags?.fallRisk}
              level={assessment.safetyFallRisk?.fallRiskLevel}
            />
            <RiskBadge
              icon={Heart}
              label="Wound Risk"
              active={assessment.riskFlags?.woundRisk}
            />
            <RiskBadge
              icon={Activity}
              label="Hospitalization"
              active={assessment.riskFlags?.hospitalizationRisk}
            />
            <RiskBadge
              icon={Shield}
              label="Medication"
              active={assessment.riskFlags?.medicationIssues}
            />
            <RiskBadge
              icon={Shield}
              label="Infection"
              active={assessment.riskFlags?.infectionConcerns}
            />
          </div>
        </div>

        {/* Reason for Visit */}
        <SummarySection title="Reason for Visit">
          <InfoField label="Visit Type" value={assessment.visitType} />
          <InfoField label="Reason" value={assessment.reasonForVisit} />
          <InfoField label="Chief Complaint" value={assessment.chiefComplaint} />
        </SummarySection>

        {/* Vital Signs */}
        <SummarySection title="Vital Signs">
          <div className="grid grid-cols-3 gap-4">
            <InfoField
              label="Temperature"
              value={assessment.vitalSigns?.temperature ? `${assessment.vitalSigns.temperature}°F (${assessment.vitalSigns.temperatureRoute})` : '—'}
              isAbnormal={assessment.vitalSigns?.temperature && assessment.vitalSigns.temperature > 100.4}
            />
            <InfoField
              label="Pulse"
              value={assessment.vitalSigns?.pulse ? `${assessment.vitalSigns.pulse} bpm (${assessment.vitalSigns.pulseRegularity})` : '—'}
            />
            <InfoField
              label="Respirations"
              value={assessment.vitalSigns?.respirations ? `${assessment.vitalSigns.respirations} /min` : '—'}
            />
            <InfoField
              label="Blood Pressure"
              value={assessment.vitalSigns?.bloodPressure ? `${assessment.vitalSigns.bloodPressure.systolic}/${assessment.vitalSigns.bloodPressure.diastolic} (${assessment.vitalSigns.bpPosition})` : '—'}
              isAbnormal={assessment.vitalSigns?.bloodPressure && (assessment.vitalSigns.bloodPressure.systolic > 140 || assessment.vitalSigns.bloodPressure.diastolic > 90)}
            />
            <InfoField
              label="O2 Saturation"
              value={assessment.vitalSigns?.oxygenSaturation ? `${assessment.vitalSigns.oxygenSaturation}% on ${assessment.vitalSigns.oxygenSupplementation || 'room air'}` : '—'}
              isAbnormal={assessment.vitalSigns?.oxygenSaturation && assessment.vitalSigns.oxygenSaturation < 95}
            />
            <InfoField
              label="Weight"
              value={assessment.vitalSigns?.weight ? `${assessment.vitalSigns.weight} lbs` : '—'}
            />
          </div>
        </SummarySection>

        {/* Pain Assessment */}
        {assessment.painAssessment && (
          <SummarySection title="Pain Assessment">
            <div className="grid grid-cols-2 gap-4">
              <InfoField
                label="Pain Level"
                value={assessment.painAssessment.severity !== undefined ? `${assessment.painAssessment.severity}/10` : '—'}
                isAbnormal={assessment.painAssessment.severity && assessment.painAssessment.severity > 4}
              />
              <InfoField label="Location" value={assessment.painAssessment.location} />
              <InfoField label="Quality" value={assessment.painAssessment.quality?.join(', ')} />
              <InfoField label="Management" value={assessment.painAssessment.currentManagement} />
            </div>
            {assessment.painAssessment.narrative && (
              <InfoField label="Narrative" value={assessment.painAssessment.narrative} />
            )}
          </SummarySection>
        )}

        {/* System Assessments */}
        {assessment.cardiopulmonary && (
          <SystemSummarySection
            title="Cardiopulmonary"
            data={assessment.cardiopulmonary}
          />
        )}

        {assessment.neurological && (
          <SystemSummarySection
            title="Neurological"
            data={assessment.neurological}
          />
        )}

        {assessment.gastrointestinal && (
          <SystemSummarySection
            title="Gastrointestinal"
            data={assessment.gastrointestinal}
          />
        )}

        {assessment.genitourinary && (
          <SystemSummarySection
            title="Genitourinary"
            data={assessment.genitourinary}
          />
        )}

        {/* Integumentary/Wounds */}
        {assessment.integumentary && (
          <SummarySection title="Integumentary / Wound Status">
            <InfoField
              label="Status"
              value={assessment.integumentary.normalFindings ? 'Skin intact, no wounds' : `${assessment.integumentary.wounds?.length || 0} wound(s) present`}
              isAbnormal={assessment.integumentary.woundsPresent}
            />
            {assessment.integumentary.wounds?.map((wound, idx) => (
              <div key={wound.id} className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Wound #{idx + 1} - {wound.location}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoField label="Type" value={wound.type} />
                  <InfoField label="Stage" value={wound.stage} />
                  <InfoField label="Size" value={wound.length && wound.width ? `${wound.length} x ${wound.width}${wound.depth ? ` x ${wound.depth}` : ''} cm` : '—'} />
                  <InfoField label="Drainage" value={wound.drainage} />
                  <InfoField label="Treatment" value={wound.treatment} className="col-span-2" />
                </div>
              </div>
            ))}
            {assessment.integumentary.narrative && (
              <InfoField label="Narrative" value={assessment.integumentary.narrative} />
            )}
          </SummarySection>
        )}

        {/* Medication Reconciliation */}
        {assessment.medicationReconciliation && (
          <SummarySection title="Medication Reconciliation">
            <InfoField
              label="Status"
              value={assessment.medicationReconciliation.medicationsReviewed ? 'Medications reviewed' : 'Not reviewed'}
            />
            {assessment.medicationReconciliation.changesIdentified && (
              <InfoField label="Changes Identified" value="Yes" isAbnormal />
            )}
            {assessment.medicationReconciliation.adherenceIssues && assessment.medicationReconciliation.adherenceIssues.length > 0 && (
              <InfoField label="Adherence Issues" value={assessment.medicationReconciliation.adherenceIssues.join(', ')} isAbnormal />
            )}
            {assessment.medicationReconciliation.narrative && (
              <InfoField label="Narrative" value={assessment.medicationReconciliation.narrative} />
            )}
          </SummarySection>
        )}

        {/* Safety/Fall Risk */}
        {assessment.safetyFallRisk && (
          <SummarySection title="Safety / Fall Risk Assessment">
            <div className="grid grid-cols-2 gap-4">
              <InfoField
                label="Fall Risk Score"
                value={assessment.safetyFallRisk.fallRiskScore?.toString()}
                isAbnormal={assessment.safetyFallRisk.fallRiskLevel === 'high' || assessment.safetyFallRisk.fallRiskLevel === 'moderate'}
              />
              <InfoField
                label="Risk Level"
                value={assessment.safetyFallRisk.fallRiskLevel}
                isAbnormal={assessment.safetyFallRisk.fallRiskLevel === 'high' || assessment.safetyFallRisk.fallRiskLevel === 'moderate'}
              />
            </div>
            {assessment.safetyFallRisk.riskFactors && assessment.safetyFallRisk.riskFactors.length > 0 && (
              <InfoField label="Risk Factors" value={assessment.safetyFallRisk.riskFactors.join(', ')} />
            )}
            {assessment.safetyFallRisk.interventionsImplemented && assessment.safetyFallRisk.interventionsImplemented.length > 0 && (
              <InfoField label="Interventions" value={assessment.safetyFallRisk.interventionsImplemented.join(', ')} />
            )}
            {assessment.safetyFallRisk.narrative && (
              <InfoField label="Narrative" value={assessment.safetyFallRisk.narrative} />
            )}
          </SummarySection>
        )}

        {/* Follow-up Needs */}
        {assessment.followUpNeeds && (
          <SummarySection title="Follow-up Needs">
            {assessment.followUpNeeds.physicianNotificationNeeded && (
              <>
                <InfoField label="Physician Notification" value="Required" isAbnormal />
                <InfoField label="Reason" value={assessment.followUpNeeds.physicianNotificationReason} />
              </>
            )}
            {assessment.followUpNeeds.narrative && (
              <InfoField label="Recommendations" value={assessment.followUpNeeds.narrative} />
            )}
          </SummarySection>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Edit Assessment
            </button>
          )}
          {onSign && assessment.status === 'pending_review' && (
            <button
              onClick={onSign}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface SummarySectionProps {
  title: string;
  children: React.ReactNode;
}

function SummarySection({ title, children }: SummarySectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}

interface SystemSummarySectionProps {
  title: string;
  data: {
    normalFindings?: boolean;
    abnormalFindings?: string[];
    narrative?: string;
  };
}

function SystemSummarySection({ title, data }: SystemSummarySectionProps) {
  return (
    <SummarySection title={title}>
      <InfoField
        label="Status"
        value={data.normalFindings ? 'Normal findings' : 'Abnormal findings noted'}
        isAbnormal={!data.normalFindings}
      />
      {data.abnormalFindings && data.abnormalFindings.length > 0 && (
        <InfoField label="Findings" value={data.abnormalFindings.join(', ')} isAbnormal />
      )}
      {data.narrative && (
        <InfoField label="Narrative" value={data.narrative} />
      )}
    </SummarySection>
  );
}

interface InfoFieldProps {
  label: string;
  value?: string | number;
  isAbnormal?: boolean;
  className?: string;
}

function InfoField({ label, value, isAbnormal, className }: InfoFieldProps) {
  if (!value) return null;

  return (
    <div className={className}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className={`text-sm ${isAbnormal ? 'text-amber-900 font-medium' : 'text-gray-900'}`}>
        {isAbnormal && <span className="mr-1">⚠️</span>}
        {value}
      </dd>
    </div>
  );
}

interface RiskBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  level?: string;
}

function RiskBadge({ icon: Icon, label, active, level }: RiskBadgeProps) {
  const levelColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
  };

  const defaultColor = active ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200';
  const color = level ? levelColors[level as keyof typeof levelColors] : defaultColor;

  return (
    <div className={`border rounded-lg p-3 flex flex-col items-center gap-2 ${color}`}>
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium text-center">{label}</span>
      {level && (
        <span className="text-xs uppercase">{level}</span>
      )}
    </div>
  );
}
