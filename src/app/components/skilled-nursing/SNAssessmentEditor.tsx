/**
 * SN Assessment Editor
 * Main editor component with all assessment sections
 */

import React, { useState, useEffect } from 'react';
import { Save, Send, AlertTriangle, ChevronRight, Link2 } from 'lucide-react';
import { SNRiskSummaryCards } from './SNRiskSummaryCards';
import { SNLinkageModal } from './SNLinkageModal';
import {
  ReasonForVisitSection,
  VitalSignsSection,
  PainAssessmentSection,
  SystemAssessmentSection,
} from './SNAssessmentSections';
import {
  IntegumentarySection,
  MedicationReconciliationSection,
  SafetyFallRiskSection,
  FollowUpNeedsSection,
} from './SNAssessmentSections2';
import type { SNAssessment } from '../../data/snAssessmentGateway';

interface SNAssessmentEditorProps {
  assessmentId?: string;
  patientId: string;
  patientName: string;
  onSave?: (assessment: Partial<SNAssessment>) => void;
  onSubmit?: (assessmentId: string) => void;
  onCancel?: () => void;
}

export function SNAssessmentEditor({
  assessmentId,
  patientId,
  patientName,
  onSave,
  onSubmit,
  onCancel,
}: SNAssessmentEditorProps) {
  const [assessment, setAssessment] = useState<Partial<SNAssessment>>({
    patientId,
    patientName,
    visitDate: new Date().toISOString().split('T')[0],
    status: 'in_progress',
  });

  const [activeSection, setActiveSection] = useState('reason');
  const [showRiskSummary, setShowRiskSummary] = useState(true);
  const [linkageModal, setLinkageModal] = useState<{
    isOpen: boolean;
    finding: { type: string; description: string };
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleAutoSave();
    }, 60000); // Auto-save every minute

    return () => clearInterval(autoSaveInterval);
  }, [assessment]);

  const handleAutoSave = async () => {
    if (assessment.id) {
      setIsSaving(true);
      try {
        await onSave?.(assessment);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(assessment);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save assessment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateAssessment()) {
      alert('Please complete all required sections');
      return;
    }

    if (!assessment.id) {
      alert('Please save the assessment first');
      return;
    }

    try {
      await onSubmit?.(assessment.id);
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Failed to submit assessment');
    }
  };

  const validateAssessment = (): boolean => {
    // Check required fields
    if (!assessment.reasonForVisit || !assessment.visitType) {
      return false;
    }

    if (!assessment.vitalSigns?.temperature || !assessment.vitalSigns?.pulse) {
      return false;
    }

    if (!assessment.medicationReconciliation?.medicationsReviewed) {
      return false;
    }

    return true;
  };

  const updateAssessment = (updates: Partial<SNAssessment>) => {
    setAssessment(prev => ({ ...prev, ...updates }));
  };

  const handleLinkage = (linkages: any) => {
    updateAssessment({
      linkedGoals: [...(assessment.linkedGoals || []), ...linkages.goals],
      linkedInterventions: [...(assessment.linkedInterventions || []), ...linkages.interventions],
      linkedOrders: [...(assessment.linkedOrders || []), ...linkages.orders],
      followUpNeeds: {
        ...assessment.followUpNeeds,
        physicianNotificationNeeded: linkages.notifyPhysician,
      },
    });
  };

  const sections = [
    { id: 'reason', label: 'Reason for Visit', required: true },
    { id: 'vitals', label: 'Vital Signs', required: true },
    { id: 'pain', label: 'Pain Assessment', required: false },
    { id: 'cardiopulmonary', label: 'Cardiopulmonary', required: false },
    { id: 'neurological', label: 'Neurological', required: false },
    { id: 'gastrointestinal', label: 'Gastrointestinal', required: false },
    { id: 'genitourinary', label: 'Genitourinary', required: false },
    { id: 'integumentary', label: 'Integumentary', required: false },
    { id: 'medications', label: 'Medication Reconciliation', required: true },
    { id: 'safety', label: 'Safety/Fall Risk', required: true },
    { id: 'education', label: 'Patient Education', required: false },
    { id: 'caregiver', label: 'Caregiver Support', required: false },
    { id: 'careplan', label: 'Care Plan Updates', required: false },
    { id: 'interventions', label: 'Interventions', required: false },
    { id: 'response', label: 'Patient Response', required: false },
    { id: 'followup', label: 'Follow-up Needs', required: false },
  ];

  const getAbnormalFindings = () => {
    const findings: string[] = [];

    if (assessment.vitalSigns?.temperature && assessment.vitalSigns.temperature > 100.4) {
      findings.push('Elevated temperature');
    }

    if (assessment.vitalSigns?.bloodPressure) {
      const { systolic, diastolic } = assessment.vitalSigns.bloodPressure;
      if (systolic > 140 || diastolic > 90) {
        findings.push('Elevated blood pressure');
      }
    }

    if (assessment.painAssessment?.severity && assessment.painAssessment.severity > 4) {
      findings.push(`Pain ${assessment.painAssessment.severity}/10`);
    }

    if (assessment.integumentary?.woundsPresent) {
      findings.push(`${assessment.integumentary.wounds?.length || 0} wound(s) present`);
    }

    if (assessment.safetyFallRisk?.fallRiskLevel === 'high') {
      findings.push('High fall risk');
    }

    return findings;
  };

  const abnormalFindings = getAbnormalFindings();

  return (
    <div className="h-full flex">
      {/* Left Navigation */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{patientName}</h2>
          <p className="text-sm text-gray-600 mt-0.5">
            {assessment.visitType ? assessment.visitType.charAt(0).toUpperCase() + assessment.visitType.slice(1) : 'New'} Assessment
          </p>
          {lastSaved && (
            <p className="text-xs text-gray-500 mt-2">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  {section.label}
                  {section.required && <span className="text-red-500">*</span>}
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
          </nav>
        </div>

        {/* Abnormal Findings Summary */}
        {abnormalFindings.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-amber-50">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-amber-900 mb-1">Abnormal Findings</h4>
                <ul className="text-xs text-amber-800 space-y-0.5">
                  {abnormalFindings.map((finding, idx) => (
                    <li key={idx} className="truncate">{finding}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Section Content */}
            {activeSection === 'reason' && (
              <ReasonForVisitSection
                data={assessment}
                onChange={updateAssessment}
                patientId={patientId}
              />
            )}

            {activeSection === 'vitals' && (
              <VitalSignsSection
                data={assessment}
                onChange={updateAssessment}
                patientId={patientId}
              />
            )}

            {activeSection === 'pain' && (
              <PainAssessmentSection
                data={assessment}
                onChange={updateAssessment}
                patientId={patientId}
              />
            )}

            {activeSection === 'cardiopulmonary' && (
              <SystemAssessmentSection
                title="Cardiopulmonary Assessment"
                data={assessment}
                field="cardiopulmonary"
                onChange={updateAssessment}
                patientId={patientId}
              />
            )}

            {activeSection === 'neurological' && (
              <SystemAssessmentSection
                title="Neurological Assessment"
                data={assessment}
                field="neurological"
                onChange={updateAssessment}
                patientId={patientId}
              />
            )}

            {activeSection === 'gastrointestinal' && (
              <SystemAssessmentSection
                title="Gastrointestinal Assessment"
                data={assessment}
                field="gastrointestinal"
                onChange={updateAssessment}
                patientId={patientId}
              />
            )}

            {activeSection === 'genitourinary' && (
              <SystemAssessmentSection
                title="Genitourinary Assessment"
                data={assessment}
                field="genitourinary"
                onChange={updateAssessment}
                patientId={patientId}
              />
            )}

            {activeSection === 'integumentary' && (
              <IntegumentarySection
                data={assessment}
                onChange={updateAssessment}
                patientId={patientId}
              />
            )}

            {activeSection === 'medications' && (
              <MedicationReconciliationSection
                data={assessment}
                onChange={updateAssessment}
                patientId={patientId}
              />
            )}

            {activeSection === 'safety' && (
              <SafetyFallRiskSection
                data={assessment}
                onChange={updateAssessment}
                patientId={patientId}
              />
            )}

            {activeSection === 'followup' && (
              <FollowUpNeedsSection
                data={assessment}
                onChange={updateAssessment}
              />
            )}

            {/* Link to Care Plan Button */}
            <div className="pt-4">
              <button
                onClick={() => setLinkageModal({
                  isOpen: true,
                  finding: {
                    type: 'Assessment Finding',
                    description: 'Link findings from this section to care plan',
                  },
                })}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Link2 className="h-4 w-4" />
                Link to Care Plan
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Risk Summary */}
        {showRiskSummary && (
          <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <SNRiskSummaryCards
                assessment={assessment}
                onLinkToCarePlan={(riskType) => {
                  setLinkageModal({
                    isOpen: true,
                    finding: {
                      type: 'Risk Finding',
                      description: riskType,
                    },
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-sm text-gray-500">Saving...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Submit for Review
          </button>
        </div>
      </div>

      {/* Linkage Modal */}
      {linkageModal && (
        <SNLinkageModal
          isOpen={linkageModal.isOpen}
          onClose={() => setLinkageModal(null)}
          finding={linkageModal.finding}
          onLink={handleLinkage}
        />
      )}
    </div>
  );
}
