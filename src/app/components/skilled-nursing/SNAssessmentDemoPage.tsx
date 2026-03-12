/**
 * SN Assessment Demo Page
 * Demonstration of the complete Skilled Nursing Assessment system
 */

import React, { useState } from 'react';
import { SNAssessmentWorkspace } from './SNAssessmentWorkspace';
import { SNAssessmentEditor } from './SNAssessmentEditor';
import { SNReviewSummary } from './SNReviewSummary';
import type { SNAssessment } from '../../data/snAssessmentGateway';

type ViewMode = 'workspace' | 'editor' | 'review';

export function SNAssessmentDemoPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('workspace');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // Mock assessment for review demo
  const mockAssessment: SNAssessment = {
    id: 'sn-001',
    patientId: 'pt-001',
    patientName: 'Margaret Thompson',
    visitDate: '2026-03-12',
    visitType: 'routine',
    status: 'pending_review',
    nurseId: 'nurse-001',
    nurseName: 'Sarah Johnson, RN',
    
    reasonForVisit: 'Routine skilled nursing visit for wound care, vital signs monitoring, and medication management',
    chiefComplaint: 'Patient reports mild pain at wound site, well controlled with current pain medication',
    
    vitalSigns: {
      temperature: 98.6,
      temperatureRoute: 'oral',
      pulse: 76,
      pulseRegularity: 'regular',
      respirations: 18,
      bloodPressure: { systolic: 138, diastolic: 84 },
      bpPosition: 'sitting',
      oxygenSaturation: 97,
      oxygenSupplementation: 'Room air',
      weight: 165,
      height: 64,
      bmi: 28.3,
    },
    
    painAssessment: {
      location: 'Right heel wound site',
      quality: ['Dull', 'Aching'],
      severity: 3,
      onset: 'Chronic, present since wound development',
      duration: 'Intermittent, worse after standing',
      alleviatingFactors: 'Rest, elevation, pain medication',
      aggravatingFactors: 'Weight bearing, prolonged standing',
      currentManagement: 'Tylenol 650mg q6h PRN',
      effectiveness: 'effective',
      narrative: 'Patient reports pain well-controlled with current regimen. Pain does not limit ADLs. Patient able to ambulate with walker without significant discomfort.',
    },
    
    cardiopulmonary: {
      normalFindings: true,
      narrative: 'Heart regular rate and rhythm, no murmurs or extra sounds. Lungs clear to auscultation bilaterally, no wheezes, rales, or rhonchi. No peripheral edema noted. Distal pulses palpable and equal bilaterally.',
    },
    
    neurological: {
      normalFindings: true,
      narrative: 'Alert and oriented x4 (person, place, time, situation). Speech clear and appropriate. Follows complex commands. Steady gait with rolling walker. No focal neurological deficits noted.',
    },
    
    gastrointestinal: {
      normalFindings: true,
      narrative: 'Abdomen soft, non-tender, non-distended. Bowel sounds present in all quadrants. Regular bowel movements, no constipation or diarrhea reported. Good appetite, tolerating regular diet well.',
    },
    
    genitourinary: {
      normalFindings: true,
      narrative: 'Voiding without difficulty. Denies dysuria, frequency, or urgency. Urine clear yellow. Continent of bowel and bladder.',
    },
    
    integumentary: {
      normalFindings: false,
      woundsPresent: true,
      wounds: [
        {
          id: 'wound-001',
          location: 'Right heel',
          type: 'pressure_injury',
          length: 2.0,
          width: 1.5,
          depth: 0.3,
          stage: 'Stage 2',
          drainage: 'Minimal serous',
          odor: 'None',
          periWoundSkin: 'Intact, no erythema or maceration',
          treatment: 'Wound cleansed with normal saline, Aquacel Ag dressing applied, covered with foam dressing. Heel off-loading boot in place.',
          response: 'Wound showing signs of healing. Granulation tissue present. Size decreased from 2.5 x 2.0 cm at last visit (3 days ago).',
        },
      ],
      narrative: 'Skin warm, dry, and intact throughout except as noted. Right heel pressure injury healing well with current treatment plan. Patient and caregiver demonstrate proper technique for pressure relief and heel protection.',
    },
    
    medicationReconciliation: {
      medicationsReviewed: true,
      changesIdentified: false,
      adherenceIssues: [],
      educationProvided: ['Medication schedule review', 'Importance of taking blood pressure medication regularly'],
      narrative: 'Medication list reviewed with patient. Patient verbalizes understanding of medication schedule. No new medications added. No medications discontinued. Patient reports good adherence with medication regimen. Using pill organizer successfully.',
    },
    
    safetyFallRisk: {
      fallRiskScore: 7,
      fallRiskLevel: 'moderate',
      riskFactors: ['History of falls', 'Use of assistive device', 'Gait/balance impairment'],
      environmentalHazards: [],
      interventionsImplemented: [
        'Patient education on fall prevention',
        'Assistive device provided/reviewed',
        'Home safety assessment completed',
        'Adequate lighting',
      ],
      narrative: 'Patient using rolling walker appropriately and consistently. Home environment safe, no hazards identified. Patient and caregiver educated on fall prevention strategies. Patient verbalizes understanding of importance of using walker at all times when ambulating.',
    },
    
    patientEducation: {
      topicsDiscussed: ['Wound care', 'Fall prevention', 'Medication management', 'Signs of infection'],
      materialsProvided: ['Wound care instructions', 'Fall prevention tips', 'Medication list'],
      comprehensionLevel: 'good',
      barriers: [],
      narrative: 'Patient demonstrates good understanding of disease process and treatment plan. Patient able to verbalize signs/symptoms that require notification of nurse or physician. Written materials provided and reviewed.',
    },
    
    caregiverSupport: {
      caregiverPresent: true,
      caregiverName: 'John Thompson',
      relationship: 'Husband',
      supportLevel: 'excellent',
      concerns: [],
      educationProvided: ['Wound care assistance', 'Fall prevention strategies', 'When to call nurse'],
      narrative: 'Caregiver present for visit. Caregiver very supportive and engaged in patient care. Demonstrates understanding of care needs. No concerns expressed at this time.',
    },
    
    carePlanUpdates: {
      goalsReviewed: true,
      goalsModified: [],
      newGoals: [],
      interventionsModified: [],
      narrative: 'Patient goals reviewed. Patient making progress toward goals: 1) Wound healing - improving, 2) Fall prevention - stable, 3) Medication compliance - met. No modifications to current care plan at this time.',
    },
    
    interventionsPerformed: {
      interventions: [
        {
          id: 'int-001',
          intervention: 'Wound care to right heel pressure injury',
          time: '10:15 AM',
          response: 'Tolerated well, no discomfort during procedure',
        },
        {
          id: 'int-002',
          intervention: 'Vital signs monitoring',
          time: '10:00 AM',
          response: 'All vital signs within normal limits',
        },
        {
          id: 'int-003',
          intervention: 'Medication reconciliation',
          time: '10:30 AM',
          response: 'Patient verbalizes understanding, no changes needed',
        },
      ],
      narrative: 'All skilled nursing interventions completed as planned. Patient tolerated interventions well without adverse reactions.',
    },
    
    patientResponse: {
      overallResponse: 'stable',
      specificResponses: [
        'Wound showing improvement',
        'Vital signs stable',
        'Pain well-controlled',
        'Good medication compliance',
        'Safe home environment',
      ],
      adverseReactions: [],
      narrative: 'Patient stable and progressing well toward goals. No adverse reactions or unexpected findings. Patient and caregiver engaged and compliant with care plan.',
    },
    
    followUpNeeds: {
      physicianNotificationNeeded: false,
      ordersNeeded: [],
      nextVisitRecommendations: ['Continue current wound care protocol', 'Monitor for signs of infection', 'Reassess fall risk'],
      narrative: 'Continue current visit frequency (3x/week). Next visit scheduled for 03/15. Patient to call nurse with any questions or concerns between visits.',
    },
    
    riskFlags: {
      fallRisk: true,
      woundRisk: true,
      hospitalizationRisk: false,
      medicationIssues: false,
      infectionConcerns: false,
    },
    
    linkedGoals: ['goal-001', 'goal-002'],
    linkedInterventions: ['int-001', 'int-002'],
    linkedOrders: [],
    
    createdAt: '2026-03-12T09:30:00Z',
    updatedAt: '2026-03-12T11:00:00Z',
  };

  const handleCreateNew = () => {
    setViewMode('editor');
    setSelectedAssessmentId(null);
  };

  const handleViewAssessment = (id: string) => {
    setSelectedAssessmentId(id);
    setViewMode('review');
  };

  const handleEditAssessment = (id: string) => {
    setSelectedAssessmentId(id);
    setViewMode('editor');
  };

  const handleSaveAssessment = async (assessment: Partial<SNAssessment>) => {
    console.log('Saving assessment:', assessment);
    // In production, call API
  };

  const handleSubmitAssessment = async (assessmentId: string) => {
    console.log('Submitting assessment:', assessmentId);
    // In production, call API
    alert('Assessment submitted for review');
    setViewMode('workspace');
  };

  const handleCancel = () => {
    setViewMode('workspace');
  };

  const handleEdit = () => {
    setViewMode('editor');
  };

  const handleSign = () => {
    alert('Signature modal would open here');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 border-b border-purple-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Skilled Nursing Assessment Module - Demo</h1>
            <p className="text-sm text-purple-100 mt-1">
              Complete nursing assessment workflow with structured documentation, risk scoring, and care plan integration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('workspace')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'workspace'
                  ? 'bg-white text-purple-600'
                  : 'bg-purple-700 text-white hover:bg-purple-800'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => setViewMode('editor')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'editor'
                  ? 'bg-white text-purple-600'
                  : 'bg-purple-700 text-white hover:bg-purple-800'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('review')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'review'
                  ? 'bg-white text-purple-600'
                  : 'bg-purple-700 text-white hover:bg-purple-800'
              }`}
            >
              Review
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'workspace' && (
          <SNAssessmentWorkspace
            onCreateNew={handleCreateNew}
            onViewAssessment={handleViewAssessment}
            onEditAssessment={handleEditAssessment}
          />
        )}

        {viewMode === 'editor' && (
          <SNAssessmentEditor
            assessmentId={selectedAssessmentId || undefined}
            patientId="pt-001"
            patientName="Margaret Thompson"
            onSave={handleSaveAssessment}
            onSubmit={handleSubmitAssessment}
            onCancel={handleCancel}
          />
        )}

        {viewMode === 'review' && (
          <SNReviewSummary
            assessment={mockAssessment}
            onEdit={handleEdit}
            onSign={handleSign}
          />
        )}
      </div>

      {/* Demo Info Footer */}
      <div className="bg-gray-100 border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            <strong>Demo Features:</strong> Queue management • 17 assessment sections • Quick phrases • Patient history • Risk scoring • Care plan linkage • Signature workflow
          </div>
          <div className="text-gray-500">
            Production-ready SN Assessment Module
          </div>
        </div>
      </div>
    </div>
  );
}
