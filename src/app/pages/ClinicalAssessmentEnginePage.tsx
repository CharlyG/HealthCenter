/**
 * Clinical Assessment Engine Page
 * Demo page showing assessment engine with different assessment types
 */

import React, { useState } from 'react';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AssessmentEngine } from '../components/clinical-assessment/AssessmentEngine';
import { useAssessmentAPI } from '../hooks/useAssessmentAPI';
import {
  getAssessmentDefinition,
  physicalTherapyEvaluation,
  speechTherapyEvaluation,
  occupationalTherapyEvaluation,
  skilledNursingAssessment,
} from '../components/clinical-assessment/assessmentDefinitions';
import type { AssessmentInstance, AssessmentType } from '../components/clinical-assessment/types';
import { toast } from 'sonner';

const ASSESSMENT_TYPES = [
  {
    type: 'physical-therapy-evaluation' as AssessmentType,
    title: 'Physical Therapy Evaluation',
    discipline: 'Physical Therapy',
    description: 'Comprehensive PT evaluation including mobility, strength, and function',
    icon: '🦿',
  },
  {
    type: 'occupational-therapy-evaluation' as AssessmentType,
    title: 'Occupational Therapy Evaluation',
    discipline: 'Occupational Therapy',
    description: 'ADL and IADL assessment for functional independence',
    icon: '🏠',
  },
  {
    type: 'speech-therapy-evaluation' as AssessmentType,
    title: 'Speech Therapy Evaluation',
    discipline: 'Speech Therapy',
    description: 'Communication, cognition, and swallowing assessment',
    icon: '🗣️',
  },
  {
    type: 'skilled-nursing-assessment' as AssessmentType,
    title: 'Skilled Nursing Assessment',
    discipline: 'Skilled Nursing',
    description: 'Comprehensive nursing assessment and care planning',
    icon: '⚕️',
  },
  {
    type: 'oasis-e-assessment' as AssessmentType,
    title: 'OASIS-E Assessment',
    discipline: 'Skilled Nursing',
    description: 'Medicare-required OASIS-E comprehensive assessment',
    icon: '📋',
  },
];

export default function ClinicalAssessmentEnginePage() {
  const [selectedType, setSelectedType] = useState<AssessmentType | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<AssessmentInstance | null>(null);
  const api = useAssessmentAPI();

  const handleStartAssessment = async (type: AssessmentType) => {
    // Create assessment via API
    const assessment = await api.createAssessment({
      type,
      patientId: 'patient-demo-001',
      patientName: 'Johnson, Mary',
      admissionId: 'admission-demo-001',
      clinicianId: 'clinician-demo-001',
      clinicianName: 'Sarah Thompson',
    });

    if (assessment) {
      setActiveAssessment(assessment);
      setSelectedType(type);
      toast.success('Assessment created successfully');
    } else {
      toast.error('Failed to create assessment');
    }
  };

  const handleSave = async (data: Record<string, any>) => {
    if (!activeAssessment) return;

    const updated = await api.updateAssessment(activeAssessment.id, { data });
    
    if (updated) {
      setActiveAssessment(updated);
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    if (!activeAssessment) return;

    const submitted = await api.submitAssessment(activeAssessment.id, data);
    
    if (submitted) {
      toast.success('Assessment submitted successfully!');
      setActiveAssessment(submitted);
      
      // Return to selection after brief delay
      setTimeout(() => {
        setActiveAssessment(null);
        setSelectedType(null);
      }, 2000);
    } else {
      toast.error('Failed to submit assessment');
    }
  };

  const handleCancel = () => {
    setActiveAssessment(null);
    setSelectedType(null);
  };

  // If assessment is active, show the engine
  if (activeAssessment && selectedType) {
    const definition = getAssessmentDefinition(selectedType);
    if (!definition) return null;

    return (
      <AssessmentEngine
        definition={definition}
        instance={activeAssessment}
        onSave={handleSave}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        autoSave={true}
      />
    );
  }

  // Otherwise show assessment selection
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clinical Assessment Engine</h1>
              <p className="text-sm text-gray-600 mt-1">
                Select an assessment type to begin evaluation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About the Assessment Engine</h3>
                <p className="text-sm text-blue-800 mb-3">
                  The Clinical Assessment Engine provides a unified, reusable framework for all discipline-specific
                  clinical evaluations with built-in validation, autosave, and progress tracking.
                </p>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-blue-900">✓ Autosave</p>
                    <p className="text-blue-700">Automatic draft saving</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">✓ Validation</p>
                    <p className="text-blue-700">Required field checks</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">✓ Progress</p>
                    <p className="text-blue-700">Real-time completion</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">✓ Mobile</p>
                    <p className="text-blue-700">Responsive design</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Type Selection */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Assessments</h2>
          <div className="grid grid-cols-2 gap-6">
            {ASSESSMENT_TYPES.map((assessment) => (
              <Card
                key={assessment.type}
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                onClick={() => handleStartAssessment(assessment.type)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{assessment.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{assessment.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {assessment.discipline}
                        </Badge>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{assessment.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button className="w-full" variant="outline">
                      Start Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Types Supported</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { type: 'Text Input', desc: 'Short and long text responses' },
              { type: 'Numeric Input', desc: 'Numbers with min/max validation' },
              { type: 'Dropdown', desc: 'Single selection from options' },
              { type: 'Radio Buttons', desc: 'Single choice selection' },
              { type: 'Checkboxes', desc: 'Multiple selection options' },
              { type: 'Multi-Select', desc: 'Multiple checkbox selections' },
              { type: 'Pain Scale', desc: '0-10 visual pain scale slider' },
              { type: 'Functional Score', desc: '0-5 functional rating slider' },
              { type: 'Date Field', desc: 'Date picker for temporal data' },
            ].map((feature, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{feature.type}</h4>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}