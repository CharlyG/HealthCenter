/**
 * SN Assessment Sections
 * Individual section components for the SN assessment editor
 */

import React, { useState } from 'react';
import { AlertCircle, MessageSquare, History, Plus, Trash2 } from 'lucide-react';
import { SNQuickPhrases } from './SNQuickPhrases';
import { SNPatientHistoryPanel } from './SNPatientHistoryPanel';
import type { SNAssessment } from '../../data/snAssessmentGateway';

// Base section wrapper component
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

// Narrative field with quick phrases and history
interface NarrativeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  patientId: string;
  category: string;
  placeholder?: string;
  rows?: number;
}

function NarrativeField({
  label,
  value,
  onChange,
  patientId,
  category,
  placeholder,
  rows = 4,
}: NarrativeFieldProps) {
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleInsert = (text: string) => {
    const newValue = value ? `${value}\n${text}` : text;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <History className="h-3 w-3" />
            History
          </button>
          <button
            type="button"
            onClick={() => setShowQuickPhrases(!showQuickPhrases)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <MessageSquare className="h-3 w-3" />
            Quick Phrases
          </button>
        </div>
      </div>

      {showHistory && (
        <SNPatientHistoryPanel
          patientId={patientId}
          category={category}
          onInsert={handleInsert}
        />
      )}

      {showQuickPhrases && (
        <SNQuickPhrases
          category={category}
          onSelect={handleInsert}
          onClose={() => setShowQuickPhrases(false)}
        />
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>
  );
}

// Reason for Visit Section
interface ReasonForVisitSectionProps {
  data: Partial<SNAssessment>;
  onChange: (updates: Partial<SNAssessment>) => void;
  patientId: string;
}

export function ReasonForVisitSection({ data, onChange, patientId }: ReasonForVisitSectionProps) {
  return (
    <SectionWrapper title="Reason for Visit" required>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Visit Type</label>
          <select
            value={data.visitType || ''}
            onChange={(e) => onChange({ visitType: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type...</option>
            <option value="admission">Admission</option>
            <option value="routine">Routine</option>
            <option value="prn">PRN</option>
            <option value="recert">Recertification</option>
            <option value="discharge">Discharge</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Reason for Visit</label>
        <textarea
          value={data.reasonForVisit || ''}
          onChange={(e) => onChange({ reasonForVisit: e.target.value })}
          placeholder="Enter reason for this visit..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Chief Complaint</label>
        <textarea
          value={data.chiefComplaint || ''}
          onChange={(e) => onChange({ chiefComplaint: e.target.value })}
          placeholder="Patient's chief complaint..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
    </SectionWrapper>
  );
}

// Vital Signs Section
interface VitalSignsSectionProps {
  data: Partial<SNAssessment>;
  onChange: (updates: Partial<SNAssessment>) => void;
  patientId: string;
}

export function VitalSignsSection({ data, onChange, patientId }: VitalSignsSectionProps) {
  const vitals = data.vitalSigns || {};

  const updateVitals = (updates: Partial<SNAssessment['vitalSigns']>) => {
    onChange({
      vitalSigns: { ...vitals, ...updates },
    });
  };

  const hasAbnormal = 
    (vitals.temperature && vitals.temperature > 100.4) ||
    (vitals.bloodPressure && (vitals.bloodPressure.systolic > 140 || vitals.bloodPressure.diastolic > 90)) ||
    (vitals.oxygenSaturation && vitals.oxygenSaturation < 95);

  return (
    <SectionWrapper title="Vital Signs" required hasAbnormal={hasAbnormal}>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Temperature (°F)</label>
          <input
            type="number"
            step="0.1"
            value={vitals.temperature || ''}
            onChange={(e) => updateVitals({ temperature: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Route</label>
          <select
            value={vitals.temperatureRoute || ''}
            onChange={(e) => updateVitals({ temperatureRoute: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="oral">Oral</option>
            <option value="tympanic">Tympanic</option>
            <option value="axillary">Axillary</option>
            <option value="temporal">Temporal</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Pulse (bpm)</label>
          <input
            type="number"
            value={vitals.pulse || ''}
            onChange={(e) => updateVitals({ pulse: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Regularity</label>
          <select
            value={vitals.pulseRegularity || ''}
            onChange={(e) => updateVitals({ pulseRegularity: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="regular">Regular</option>
            <option value="irregular">Irregular</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Respirations</label>
          <input
            type="number"
            value={vitals.respirations || ''}
            onChange={(e) => updateVitals({ respirations: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Blood Pressure</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Systolic"
              value={vitals.bloodPressure?.systolic || ''}
              onChange={(e) => updateVitals({
                bloodPressure: {
                  ...vitals.bloodPressure,
                  systolic: parseInt(e.target.value),
                  diastolic: vitals.bloodPressure?.diastolic || 0,
                },
              })}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">/</span>
            <input
              type="number"
              placeholder="Diastolic"
              value={vitals.bloodPressure?.diastolic || ''}
              onChange={(e) => updateVitals({
                bloodPressure: {
                  systolic: vitals.bloodPressure?.systolic || 0,
                  diastolic: parseInt(e.target.value),
                },
              })}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Position</label>
          <select
            value={vitals.bpPosition || ''}
            onChange={(e) => updateVitals({ bpPosition: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="sitting">Sitting</option>
            <option value="standing">Standing</option>
            <option value="lying">Lying</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">O2 Saturation (%)</label>
          <input
            type="number"
            value={vitals.oxygenSaturation || ''}
            onChange={(e) => updateVitals({ oxygenSaturation: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1 block">O2 Supplementation</label>
          <input
            type="text"
            value={vitals.oxygenSupplementation || ''}
            onChange={(e) => updateVitals({ oxygenSupplementation: e.target.value })}
            placeholder="e.g., Room air, 2L NC"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            value={vitals.weight || ''}
            onChange={(e) => updateVitals({ weight: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Height (inches)</label>
          <input
            type="number"
            step="0.1"
            value={vitals.height || ''}
            onChange={(e) => updateVitals({ height: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">BMI</label>
          <input
            type="number"
            step="0.1"
            value={vitals.bmi || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}

// Pain Assessment Section
interface PainAssessmentSectionProps {
  data: Partial<SNAssessment>;
  onChange: (updates: Partial<SNAssessment>) => void;
  patientId: string;
}

export function PainAssessmentSection({ data, onChange, patientId }: PainAssessmentSectionProps) {
  const pain = data.painAssessment || {};

  const updatePain = (updates: Partial<SNAssessment['painAssessment']>) => {
    onChange({
      painAssessment: { ...pain, ...updates },
    });
  };

  const painQualities = ['Sharp', 'Dull', 'Aching', 'Burning', 'Stabbing', 'Throbbing'];

  return (
    <SectionWrapper title="Pain Assessment" hasAbnormal={(pain.severity || 0) > 4}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Pain Severity (0-10)</label>
          <input
            type="number"
            min="0"
            max="10"
            value={pain.severity || ''}
            onChange={(e) => updatePain({ severity: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
          <input
            type="text"
            value={pain.location || ''}
            onChange={(e) => updatePain({ location: e.target.value })}
            placeholder="e.g., Lower back"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">Pain Quality</label>
        <div className="flex flex-wrap gap-2">
          {painQualities.map((quality) => (
            <label key={quality} className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={pain.quality?.includes(quality) || false}
                onChange={(e) => {
                  const current = pain.quality || [];
                  const updated = e.target.checked
                    ? [...current, quality]
                    : current.filter(q => q !== quality);
                  updatePain({ quality: updated });
                }}
                className="rounded"
              />
              <span className="text-sm">{quality}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Alleviating Factors</label>
          <input
            type="text"
            value={pain.alleviatingFactors || ''}
            onChange={(e) => updatePain({ alleviatingFactors: e.target.value })}
            placeholder="What makes it better?"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Aggravating Factors</label>
          <input
            type="text"
            value={pain.aggravatingFactors || ''}
            onChange={(e) => updatePain({ aggravatingFactors: e.target.value })}
            placeholder="What makes it worse?"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <NarrativeField
        label="Pain Management Narrative"
        value={pain.narrative || ''}
        onChange={(value) => updatePain({ narrative: value })}
        patientId={patientId}
        category="pain"
        placeholder="Document pain assessment details..."
        rows={3}
      />
    </SectionWrapper>
  );
}

// System Assessment Section (reusable for cardio, neuro, GI, GU)
interface SystemAssessmentSectionProps {
  title: string;
  data: Partial<SNAssessment>;
  field: 'cardiopulmonary' | 'neurological' | 'gastrointestinal' | 'genitourinary';
  onChange: (updates: Partial<SNAssessment>) => void;
  patientId: string;
  structuredOptions?: { label: string; value: string }[];
}

export function SystemAssessmentSection({
  title,
  data,
  field,
  onChange,
  patientId,
  structuredOptions,
}: SystemAssessmentSectionProps) {
  const systemData = data[field] || { normalFindings: true };

  const updateSystem = (updates: any) => {
    onChange({
      [field]: { ...systemData, ...updates },
    });
  };

  const categoryMap: Record<string, string> = {
    cardiopulmonary: 'cardiopulmonary',
    neurological: 'neurological',
    gastrointestinal: 'gastrointestinal',
    genitourinary: 'genitourinary',
  };

  return (
    <SectionWrapper 
      title={title} 
      hasAbnormal={!systemData.normalFindings || (systemData.abnormalFindings?.length || 0) > 0}
    >
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={systemData.normalFindings || false}
            onChange={(e) => updateSystem({ normalFindings: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Normal findings</span>
        </label>
      </div>

      {!systemData.normalFindings && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Abnormal Findings</label>
          <div className="space-y-2">
            {(systemData.abnormalFindings || []).map((finding: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={finding}
                  onChange={(e) => {
                    const updated = [...(systemData.abnormalFindings || [])];
                    updated[idx] = e.target.value;
                    updateSystem({ abnormalFindings: updated });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = (systemData.abnormalFindings || []).filter((_: any, i: number) => i !== idx);
                    updateSystem({ abnormalFindings: updated });
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const updated = [...(systemData.abnormalFindings || []), ''];
                updateSystem({ abnormalFindings: updated });
              }}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add abnormal finding
            </button>
          </div>
        </div>
      )}

      <NarrativeField
        label="Narrative Documentation"
        value={systemData.narrative || ''}
        onChange={(value) => updateSystem({ narrative: value })}
        patientId={patientId}
        category={categoryMap[field]}
        placeholder={`Document ${title.toLowerCase()} assessment...`}
        rows={4}
      />
    </SectionWrapper>
  );
}
