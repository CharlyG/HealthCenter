/**
 * SN Risk Summary Cards
 * Display risk assessment cards with actionable insights
 */

import React from 'react';
import { AlertTriangle, Heart, Activity, Pill, Shield } from 'lucide-react';
import type { SNAssessment } from '../../data/snAssessmentGateway';

interface SNRiskSummaryCardsProps {
  assessment: Partial<SNAssessment>;
  onLinkToCarePlan?: (riskType: string) => void;
}

export function SNRiskSummaryCards({
  assessment,
  onLinkToCarePlan,
}: SNRiskSummaryCardsProps) {
  const risks = calculateRisks(assessment);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Risk Summary</h3>
      
      <div className="grid grid-cols-1 gap-3">
        {/* Fall Risk */}
        <RiskCard
          icon={AlertTriangle}
          title="Fall Risk"
          level={risks.fallRisk.level}
          score={risks.fallRisk.score}
          factors={risks.fallRisk.factors}
          recommendations={risks.fallRisk.recommendations}
          onAction={() => onLinkToCarePlan?.('fall_risk')}
        />

        {/* Wound Risk */}
        {risks.woundRisk.hasRisk && (
          <RiskCard
            icon={Heart}
            title="Wound Risk"
            level={risks.woundRisk.level}
            score={risks.woundRisk.score}
            factors={risks.woundRisk.factors}
            recommendations={risks.woundRisk.recommendations}
            onAction={() => onLinkToCarePlan?.('wound_risk')}
          />
        )}

        {/* Hospitalization Risk */}
        {risks.hospitalizationRisk.hasRisk && (
          <RiskCard
            icon={Activity}
            title="Hospitalization Risk"
            level={risks.hospitalizationRisk.level}
            score={risks.hospitalizationRisk.score}
            factors={risks.hospitalizationRisk.factors}
            recommendations={risks.hospitalizationRisk.recommendations}
            onAction={() => onLinkToCarePlan?.('hospitalization_risk')}
          />
        )}

        {/* Medication Issues */}
        {risks.medicationIssues.hasIssues && (
          <RiskCard
            icon={Pill}
            title="Medication Issues"
            level={risks.medicationIssues.level}
            factors={risks.medicationIssues.factors}
            recommendations={risks.medicationIssues.recommendations}
            onAction={() => onLinkToCarePlan?.('medication_issues')}
          />
        )}

        {/* Infection Concerns */}
        {risks.infectionConcerns.hasConcerns && (
          <RiskCard
            icon={Shield}
            title="Infection Concerns"
            level={risks.infectionConcerns.level}
            factors={risks.infectionConcerns.factors}
            recommendations={risks.infectionConcerns.recommendations}
            onAction={() => onLinkToCarePlan?.('infection_concerns')}
          />
        )}
      </div>
    </div>
  );
}

interface RiskCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  level: 'low' | 'moderate' | 'high';
  score?: number;
  factors: string[];
  recommendations: string[];
  onAction?: () => void;
}

function RiskCard({
  icon: Icon,
  title,
  level,
  score,
  factors,
  recommendations,
  onAction,
}: RiskCardProps) {
  const levelColors = {
    low: 'bg-green-50 border-green-200 text-green-900',
    moderate: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    high: 'bg-red-50 border-red-200 text-red-900',
  };

  const levelBadgeColors = {
    low: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`border rounded-lg p-3 ${levelColors[level]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <h4 className="text-sm font-medium">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          {score !== undefined && (
            <span className="text-xs font-medium">Score: {score}</span>
          )}
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBadgeColors[level]}`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        </div>
      </div>

      {factors.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium mb-1">Risk Factors:</p>
          <ul className="text-xs space-y-0.5">
            {factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-gray-500">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium mb-1">Recommendations:</p>
          <ul className="text-xs space-y-0.5">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-gray-500">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onAction && (
        <button
          onClick={onAction}
          className="text-xs font-medium hover:underline mt-2"
        >
          Link to Care Plan →
        </button>
      )}
    </div>
  );
}

// Risk calculation logic
function calculateRisks(assessment: Partial<SNAssessment>) {
  return {
    fallRisk: calculateFallRisk(assessment),
    woundRisk: calculateWoundRisk(assessment),
    hospitalizationRisk: calculateHospitalizationRisk(assessment),
    medicationIssues: calculateMedicationIssues(assessment),
    infectionConcerns: calculateInfectionConcerns(assessment),
  };
}

function calculateFallRisk(assessment: Partial<SNAssessment>) {
  const factors: string[] = [];
  let score = 0;

  // Check fall risk assessment data
  if (assessment.safetyFallRisk?.fallRiskScore) {
    score = assessment.safetyFallRisk.fallRiskScore;
  }

  if (assessment.safetyFallRisk?.riskFactors) {
    factors.push(...assessment.safetyFallRisk.riskFactors);
  }

  // Additional factors from other sections
  if (assessment.neurological?.abnormalFindings?.some(f => 
    f.toLowerCase().includes('gait') || f.toLowerCase().includes('balance')
  )) {
    factors.push('Gait/balance impairment noted');
    score += 5;
  }

  if (assessment.vitalSigns?.bpPosition === 'standing' && 
      assessment.vitalSigns.bloodPressure) {
    const systolic = assessment.vitalSigns.bloodPressure.systolic;
    if (systolic < 100) {
      factors.push('Orthostatic hypotension risk');
      score += 3;
    }
  }

  const level = score >= 10 ? 'high' : score >= 5 ? 'moderate' : 'low';

  const recommendations: string[] = [];
  if (level === 'high') {
    recommendations.push('Implement fall prevention interventions');
    recommendations.push('Consider PT referral for gait/balance training');
    recommendations.push('Review medications for fall risk side effects');
  } else if (level === 'moderate') {
    recommendations.push('Monitor for changes in mobility');
    recommendations.push('Educate on home safety modifications');
  }

  return { level, score, factors, recommendations };
}

function calculateWoundRisk(assessment: Partial<SNAssessment>) {
  const hasRisk = assessment.integumentary?.woundsPresent || false;
  const factors: string[] = [];
  let score = 0;

  if (assessment.integumentary?.wounds) {
    const woundCount = assessment.integumentary.wounds.length;
    factors.push(`${woundCount} wound(s) present`);
    score = woundCount * 5;

    assessment.integumentary.wounds.forEach(wound => {
      if (wound.stage?.includes('3') || wound.stage?.includes('4')) {
        factors.push(`Stage ${wound.stage} pressure injury`);
        score += 10;
      }
      if (wound.drainage?.toLowerCase().includes('purulent')) {
        factors.push('Signs of infection');
        score += 5;
      }
    });
  }

  const level = score >= 15 ? 'high' : score >= 8 ? 'moderate' : 'low';

  const recommendations: string[] = [];
  if (hasRisk) {
    if (level === 'high') {
      recommendations.push('Daily wound care and monitoring required');
      recommendations.push('Consider wound care specialist consult');
      recommendations.push('Notify physician of wound status');
    } else {
      recommendations.push('Continue current wound care protocol');
      recommendations.push('Monitor for signs of infection');
    }
  }

  return { hasRisk, level, score, factors, recommendations };
}

function calculateHospitalizationRisk(assessment: Partial<SNAssessment>) {
  const factors: string[] = [];
  let score = 0;
  let hasRisk = false;

  // Vital signs concerns
  if (assessment.vitalSigns?.temperature && assessment.vitalSigns.temperature > 100.4) {
    factors.push('Elevated temperature');
    score += 5;
    hasRisk = true;
  }

  if (assessment.vitalSigns?.bloodPressure) {
    const { systolic, diastolic } = assessment.vitalSigns.bloodPressure;
    if (systolic > 160 || diastolic > 100) {
      factors.push('Elevated blood pressure');
      score += 5;
      hasRisk = true;
    }
  }

  if (assessment.vitalSigns?.oxygenSaturation && assessment.vitalSigns.oxygenSaturation < 92) {
    factors.push('Low oxygen saturation');
    score += 8;
    hasRisk = true;
  }

  // Cardiopulmonary concerns
  if (assessment.cardiopulmonary?.concerns?.length) {
    factors.push(...assessment.cardiopulmonary.concerns);
    score += 5;
    hasRisk = true;
  }

  // Patient response
  if (assessment.patientResponse?.overallResponse === 'declined') {
    factors.push('Overall clinical decline noted');
    score += 10;
    hasRisk = true;
  }

  const level = score >= 15 ? 'high' : score >= 8 ? 'moderate' : 'low';

  const recommendations: string[] = [];
  if (hasRisk) {
    if (level === 'high') {
      recommendations.push('Contact physician immediately');
      recommendations.push('Consider ER evaluation');
      recommendations.push('Increase monitoring frequency');
    } else if (level === 'moderate') {
      recommendations.push('Notify physician of findings');
      recommendations.push('Schedule follow-up visit within 24-48 hours');
    }
  }

  return { hasRisk, level, score, factors, recommendations };
}

function calculateMedicationIssues(assessment: Partial<SNAssessment>) {
  const factors: string[] = [];
  let hasIssues = false;

  if (assessment.medicationReconciliation?.changesIdentified) {
    factors.push('Medication changes identified');
    hasIssues = true;
  }

  if (assessment.medicationReconciliation?.adherenceIssues?.length) {
    factors.push(...assessment.medicationReconciliation.adherenceIssues);
    hasIssues = true;
  }

  const level = factors.length >= 3 ? 'high' : factors.length >= 1 ? 'moderate' : 'low';

  const recommendations: string[] = [];
  if (hasIssues) {
    recommendations.push('Review medication list with physician');
    recommendations.push('Provide medication education');
    if (factors.some(f => f.toLowerCase().includes('adherence'))) {
      recommendations.push('Consider pill organizer or other adherence aids');
    }
  }

  return { hasIssues, level, factors, recommendations };
}

function calculateInfectionConcerns(assessment: Partial<SNAssessment>) {
  const factors: string[] = [];
  let hasConcerns = false;

  if (assessment.vitalSigns?.temperature && assessment.vitalSigns.temperature > 100.4) {
    factors.push('Fever present');
    hasConcerns = true;
  }

  if (assessment.integumentary?.wounds?.some(w => 
    w.drainage?.toLowerCase().includes('purulent') || 
    w.odor?.toLowerCase().includes('foul')
  )) {
    factors.push('Wound with signs of infection');
    hasConcerns = true;
  }

  if (assessment.genitourinary?.abnormalFindings?.some(f => 
    f.toLowerCase().includes('uti') || 
    f.toLowerCase().includes('dysuria')
  )) {
    factors.push('Possible urinary tract infection');
    hasConcerns = true;
  }

  if (assessment.cardiopulmonary?.abnormalFindings?.some(f => 
    f.toLowerCase().includes('productive') || 
    f.toLowerCase().includes('purulent')
  )) {
    factors.push('Productive cough with concerning sputum');
    hasConcerns = true;
  }

  const level = factors.length >= 2 ? 'high' : factors.length >= 1 ? 'moderate' : 'low';

  const recommendations: string[] = [];
  if (hasConcerns) {
    if (level === 'high') {
      recommendations.push('Notify physician immediately');
      recommendations.push('Obtain cultures as ordered');
      recommendations.push('Monitor for sepsis signs');
    } else {
      recommendations.push('Continue monitoring');
      recommendations.push('Report to physician if worsens');
    }
  }

  return { hasConcerns, level, factors, recommendations };
}
