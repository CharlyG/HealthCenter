/**
 * SN Assessment Sections Part 2
 * Additional section components (Integumentary, Medication, Safety, Education, etc.)
 */

import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import type { SNAssessment, WoundAssessment } from '../../data/snAssessmentGateway';

// Base section wrapper (duplicated from part 1 for independence)
interface SectionWrapperProps {
  title: string;
  required?: boolean;
  hasAbnormal?: boolean;
  children: React.ReactNode;
}

function SectionWrapper({ title, required, hasAbnormal, children }: SectionWrapperProps) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          {title}
          {required && <span className="text-red-500">*</span>}
          {hasAbnormal && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <AlertCircle className="h-3 w-3" />
              Abnormal findings
            </span>
          )}
        </h3>
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

// Integumentary/Wound Assessment Section
interface IntegumentarySectionProps {
  data: Partial<SNAssessment>;
  onChange: (updates: Partial<SNAssessment>) => void;
  patientId: string;
}

export function IntegumentarySection({ data, onChange, patientId }: IntegumentarySectionProps) {
  const integumentary = data.integumentary || { normalFindings: true, woundsPresent: false };

  const updateIntegumentary = (updates: any) => {
    onChange({
      integumentary: { ...integumentary, ...updates },
    });
  };

  const addWound = () => {
    const newWound: WoundAssessment = {
      id: Date.now().toString(),
      location: '',
      type: '',
    };
    updateIntegumentary({
      wounds: [...(integumentary.wounds || []), newWound],
    });
  };

  const updateWound = (id: string, updates: Partial<WoundAssessment>) => {
    const wounds = integumentary.wounds || [];
    const updated = wounds.map(w => w.id === id ? { ...w, ...updates } : w);
    updateIntegumentary({ wounds: updated });
  };

  const removeWound = (id: string) => {
    const wounds = integumentary.wounds || [];
    updateIntegumentary({ wounds: wounds.filter(w => w.id !== id) });
  };

  return (
    <SectionWrapper 
      title="Integumentary / Wound Status" 
      hasAbnormal={integumentary.woundsPresent}
    >
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={integumentary.normalFindings || false}
            onChange={(e) => updateIntegumentary({ normalFindings: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Skin intact, no wounds</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={integumentary.woundsPresent || false}
            onChange={(e) => updateIntegumentary({ woundsPresent: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Wounds present</span>
        </label>
      </div>

      {integumentary.woundsPresent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Wound Assessments</h4>
            <button
              type="button"
              onClick={addWound}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Wound
            </button>
          </div>

          {(integumentary.wounds || []).map((wound, idx) => (
            <div key={wound.id} className="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-900">Wound #{idx + 1}</h5>
                <button
                  type="button"
                  onClick={() => removeWound(wound.id)}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                  <input
                    type="text"
                    value={wound.location}
                    onChange={(e) => updateWound(wound.id, { location: e.target.value })}
                    placeholder="e.g., Right heel"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                  <select
                    value={wound.type}
                    onChange={(e) => updateWound(wound.id, { type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="pressure_injury">Pressure Injury</option>
                    <option value="surgical">Surgical</option>
                    <option value="diabetic">Diabetic Ulcer</option>
                    <option value="venous">Venous Ulcer</option>
                    <option value="arterial">Arterial Ulcer</option>
                    <option value="traumatic">Traumatic</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Length (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={wound.length || ''}
                    onChange={(e) => updateWound(wound.id, { length: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Width (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={wound.width || ''}
                    onChange={(e) => updateWound(wound.id, { width: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Depth (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={wound.depth || ''}
                    onChange={(e) => updateWound(wound.id, { depth: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Stage</label>
                  <select
                    value={wound.stage || ''}
                    onChange={(e) => updateWound(wound.id, { stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">N/A</option>
                    <option value="Stage 1">Stage 1</option>
                    <option value="Stage 2">Stage 2</option>
                    <option value="Stage 3">Stage 3</option>
                    <option value="Stage 4">Stage 4</option>
                    <option value="Unstageable">Unstageable</option>
                    <option value="DTPI">DTPI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Drainage</label>
                  <input
                    type="text"
                    value={wound.drainage || ''}
                    onChange={(e) => updateWound(wound.id, { drainage: e.target.value })}
                    placeholder="e.g., Minimal serous"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Odor</label>
                  <select
                    value={wound.odor || ''}
                    onChange={(e) => updateWound(wound.id, { odor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Foul">Foul</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Peri-wound Skin</label>
                <input
                  type="text"
                  value={wound.periWoundSkin || ''}
                  onChange={(e) => updateWound(wound.id, { periWoundSkin: e.target.value })}
                  placeholder="e.g., Intact, no erythema"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Treatment</label>
                <textarea
                  value={wound.treatment || ''}
                  onChange={(e) => updateWound(wound.id, { treatment: e.target.value })}
                  placeholder="Describe wound care treatment..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Response to Treatment</label>
                <textarea
                  value={wound.response || ''}
                  onChange={(e) => updateWound(wound.id, { response: e.target.value })}
                  placeholder="Wound healing progress..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Narrative</label>
        <textarea
          value={integumentary.narrative || ''}
          onChange={(e) => updateIntegumentary({ narrative: e.target.value })}
          placeholder="Overall skin/integumentary assessment..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
    </SectionWrapper>
  );
}

// Medication Reconciliation Section
interface MedicationReconciliationSectionProps {
  data: Partial<SNAssessment>;
  onChange: (updates: Partial<SNAssessment>) => void;
  patientId: string;
}

export function MedicationReconciliationSection({ data, onChange }: MedicationReconciliationSectionProps) {
  const medRec = data.medicationReconciliation || { medicationsReviewed: false };

  const updateMedRec = (updates: any) => {
    onChange({
      medicationReconciliation: { ...medRec, ...updates },
    });
  };

  return (
    <SectionWrapper 
      title="Medication Reconciliation" 
      required
      hasAbnormal={medRec.changesIdentified || (medRec.adherenceIssues?.length || 0) > 0}
    >
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={medRec.medicationsReviewed || false}
            onChange={(e) => updateMedRec({ medicationsReviewed: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Medications reviewed with patient/caregiver</span>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={medRec.changesIdentified || false}
            onChange={(e) => updateMedRec({ changesIdentified: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Medication changes identified</span>
        </label>
      </div>

      {medRec.changesIdentified && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Describe Changes</label>
          <textarea
            value={medRec.narrative || ''}
            onChange={(e) => updateMedRec({ narrative: e.target.value })}
            placeholder="Document medication changes, adherence issues, education provided..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Adherence Issues</label>
        <div className="flex flex-wrap gap-2">
          {['Confusion about dosing', 'Inability to afford', 'Side effects', 'Forgetfulness', 'None identified'].map((issue) => (
            <label key={issue} className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={medRec.adherenceIssues?.includes(issue) || false}
                onChange={(e) => {
                  const current = medRec.adherenceIssues || [];
                  const updated = e.target.checked
                    ? [...current, issue]
                    : current.filter(i => i !== issue);
                  updateMedRec({ adherenceIssues: updated });
                }}
                className="rounded"
              />
              {issue}
            </label>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

// Safety/Fall Risk Section
interface SafetyFallRiskSectionProps {
  data: Partial<SNAssessment>;
  onChange: (updates: Partial<SNAssessment>) => void;
  patientId: string;
}

export function SafetyFallRiskSection({ data, onChange }: SafetyFallRiskSectionProps) {
  const safety = data.safetyFallRisk || {};

  const updateSafety = (updates: any) => {
    onChange({
      safetyFallRisk: { ...safety, ...updates },
    });
  };

  const riskFactors = [
    'History of falls',
    'Gait/balance impairment',
    'Use of assistive device',
    'Medications affecting balance',
    'Environmental hazards',
    'Visual impairment',
    'Cognitive impairment',
  ];

  const interventions = [
    'Patient education on fall prevention',
    'Assistive device provided/reviewed',
    'Home safety assessment completed',
    'Grab bars recommended',
    'Remove throw rugs',
    'Adequate lighting',
    'Non-skid footwear recommended',
  ];

  return (
    <SectionWrapper 
      title="Safety / Fall Risk" 
      required
      hasAbnormal={(safety.fallRiskLevel === 'high' || safety.fallRiskLevel === 'moderate')}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Fall Risk Score</label>
          <input
            type="number"
            value={safety.fallRiskScore || ''}
            onChange={(e) => updateSafety({ fallRiskScore: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Risk Level</label>
          <select
            value={safety.fallRiskLevel || ''}
            onChange={(e) => updateSafety({ fallRiskLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Risk Factors Identified</label>
        <div className="space-y-2">
          {riskFactors.map((factor) => (
            <label key={factor} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={safety.riskFactors?.includes(factor) || false}
                onChange={(e) => {
                  const current = safety.riskFactors || [];
                  const updated = e.target.checked
                    ? [...current, factor]
                    : current.filter(f => f !== factor);
                  updateSafety({ riskFactors: updated });
                }}
                className="rounded"
              />
              <span className="text-sm">{factor}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Interventions Implemented</label>
        <div className="space-y-2">
          {interventions.map((intervention) => (
            <label key={intervention} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={safety.interventionsImplemented?.includes(intervention) || false}
                onChange={(e) => {
                  const current = safety.interventionsImplemented || [];
                  const updated = e.target.checked
                    ? [...current, intervention]
                    : current.filter(i => i !== intervention);
                  updateSafety({ interventionsImplemented: updated });
                }}
                className="rounded"
              />
              <span className="text-sm">{intervention}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Narrative</label>
        <textarea
          value={safety.narrative || ''}
          onChange={(e) => updateSafety({ narrative: e.target.value })}
          placeholder="Document safety assessment and interventions..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
    </SectionWrapper>
  );
}

// Follow-up Needs Section
interface FollowUpNeedsSectionProps {
  data: Partial<SNAssessment>;
  onChange: (updates: Partial<SNAssessment>) => void;
}

export function FollowUpNeedsSection({ data, onChange }: FollowUpNeedsSectionProps) {
  const followUp = data.followUpNeeds || { physicianNotificationNeeded: false };

  const updateFollowUp = (updates: any) => {
    onChange({
      followUpNeeds: { ...followUp, ...updates },
    });
  };

  return (
    <SectionWrapper title="Follow-up Needs">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={followUp.physicianNotificationNeeded || false}
            onChange={(e) => updateFollowUp({ physicianNotificationNeeded: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Physician notification required</span>
        </label>
      </div>

      {followUp.physicianNotificationNeeded && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Reason for Notification</label>
          <textarea
            value={followUp.physicianNotificationReason || ''}
            onChange={(e) => updateFollowUp({ physicianNotificationReason: e.target.value })}
            placeholder="Describe why physician needs to be notified..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Next Visit Recommendations</label>
        <textarea
          value={followUp.narrative || ''}
          onChange={(e) => updateFollowUp({ narrative: e.target.value })}
          placeholder="Recommendations for next visit, frequency changes, etc..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
    </SectionWrapper>
  );
}
