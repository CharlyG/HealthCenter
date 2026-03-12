/**
 * Clinical Assessment Engine
 * Reusable component for all clinical assessments
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Clock, Save, Send, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';
import type {
  AssessmentDefinition,
  AssessmentInstance,
  AssessmentSection,
  AssessmentProgress,
  SectionStatus,
  AutosaveState,
} from './types';
import { AssessmentHeader } from './AssessmentHeader';
import { AssessmentNavigation } from './AssessmentNavigation';
import { AssessmentQuestionRenderer } from './AssessmentQuestionRenderer';
import { toast } from 'sonner';

interface AssessmentEngineProps {
  definition: AssessmentDefinition;
  instance: AssessmentInstance;
  onSave: (data: Record<string, any>) => Promise<void>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  autoSave?: boolean;
  readOnly?: boolean;
}

export function AssessmentEngine({
  definition,
  instance,
  onSave,
  onSubmit,
  onCancel,
  autoSave = true,
  readOnly = false,
}: AssessmentEngineProps) {
  const [activeSection, setActiveSection] = useState<string>(definition.sections[0].id);
  const [formData, setFormData] = useState<Record<string, any>>(instance.data || {});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>({
    enabled: autoSave,
    saving: false,
  });

  // Calculate progress
  const progress = useMemo((): AssessmentProgress => {
    const sectionStatuses: Record<string, SectionStatus> = {};
    let totalQuestions = 0;
    let answeredQuestions = 0;
    let requiredQuestions = 0;
    let answeredRequiredQuestions = 0;

    definition.sections.forEach(section => {
      const sectionQuestions = section.questions;
      const sectionAnswered = sectionQuestions.filter(q => 
        formData[q.id] !== undefined && formData[q.id] !== ''
      ).length;

      totalQuestions += sectionQuestions.length;
      answeredQuestions += sectionAnswered;

      const sectionRequired = sectionQuestions.filter(q => q.required).length;
      const sectionAnsweredRequired = sectionQuestions.filter(q => 
        q.required && formData[q.id] !== undefined && formData[q.id] !== ''
      ).length;

      requiredQuestions += sectionRequired;
      answeredRequiredQuestions += sectionAnsweredRequired;

      // Determine section status
      if (sectionAnswered === 0) {
        sectionStatuses[section.id] = 'not-started';
      } else if (sectionAnsweredRequired === sectionRequired) {
        sectionStatuses[section.id] = 'completed';
      } else {
        sectionStatuses[section.id] = 'in-progress';
      }
    });

    const completedSections = Object.values(sectionStatuses).filter(s => s === 'completed').length;
    const inProgressSections = Object.values(sectionStatuses).filter(s => s === 'in-progress').length;
    const notStartedSections = Object.values(sectionStatuses).filter(s => s === 'not-started').length;

    return {
      totalSections: definition.sections.length,
      completedSections,
      inProgressSections,
      notStartedSections,
      percentComplete: Math.round((completedSections / definition.sections.length) * 100),
      totalQuestions,
      answeredQuestions,
      requiredQuestions,
      answeredRequiredQuestions,
      readyForSubmission: answeredRequiredQuestions === requiredQuestions,
    };
  }, [formData, definition.sections]);

  // Autosave effect
  useEffect(() => {
    if (!autoSave || readOnly) return;

    const timeoutId = setTimeout(async () => {
      if (Object.keys(formData).length > 0) {
        setAutosaveState(prev => ({ ...prev, saving: true }));
        try {
          await onSave(formData);
          setAutosaveState({
            enabled: true,
            lastSaved: new Date().toISOString(),
            saving: false,
          });
        } catch (err: any) {
          setAutosaveState(prev => ({
            ...prev,
            saving: false,
            error: err.message,
          }));
        }
      }
    }, 3000); // 3 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData, autoSave, onSave, readOnly]);

  const handleQuestionChange = useCallback((questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value,
    }));

    // Clear validation error for this question
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const validateSection = (section: AssessmentSection): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    section.questions.forEach(question => {
      if (question.required) {
        const value = formData[question.id];
        if (value === undefined || value === '' || value === null) {
          errors[question.id] = 'This field is required';
          isValid = false;
        }
      }

      // Additional validation
      if (question.validation && formData[question.id]) {
        const pattern = new RegExp(question.validation.pattern!);
        if (!pattern.test(String(formData[question.id]))) {
          errors[question.id] = question.validation.message || 'Invalid format';
          isValid = false;
        }
      }
    });

    setValidationErrors(prev => ({ ...prev, ...errors }));
    return isValid;
  };

  const handleSaveManual = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      toast.success('Assessment saved successfully');
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all sections
    let allValid = true;
    definition.sections.forEach(section => {
      const valid = validateSection(section);
      if (!valid) allValid = false;
    });

    if (!allValid) {
      toast.error('Please complete all required fields before submitting');
      return;
    }

    if (!progress.readyForSubmission) {
      toast.error('Please complete all required questions');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success('Assessment submitted successfully');
    } catch (err: any) {
      toast.error(`Failed to submit: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextSection = () => {
    const currentIndex = definition.sections.findIndex(s => s.id === activeSection);
    if (currentIndex < definition.sections.length - 1) {
      setActiveSection(definition.sections[currentIndex + 1].id);
    }
  };

  const handlePreviousSection = () => {
    const currentIndex = definition.sections.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(definition.sections[currentIndex - 1].id);
    }
  };

  const currentSection = definition.sections.find(s => s.id === activeSection);
  const currentSectionIndex = definition.sections.findIndex(s => s.id === activeSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === definition.sections.length - 1;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <AssessmentHeader
        assessment={{
          type: definition.type,
          title: definition.title,
          status: instance.status,
          createdAt: instance.createdAt,
        }}
        patient={{
          id: instance.patientId,
          name: instance.patientName,
          mrn: 'MRN-' + instance.patientId.slice(-6),
          dob: '1955-06-15',
          age: 68,
        }}
        admission={{
          id: instance.admissionId,
          admissionDate: '2026-03-01',
          diagnosis: 'CHF Exacerbation',
          physician: 'Dr. Smith',
        }}
        clinician={{
          id: instance.clinicianId,
          name: instance.clinicianName,
          credentials: 'PT, DPT',
          discipline: definition.discipline,
        }}
      />

      {/* Autosave indicator */}
      {autosaveState.enabled && !readOnly && (
        <div className="bg-white border-b border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {autosaveState.saving ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent" />
                  <span className="text-gray-600">Saving...</span>
                </>
              ) : autosaveState.lastSaved ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                  <span className="text-gray-600">
                    Saved {new Date(autosaveState.lastSaved).toLocaleTimeString()}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-600">Autosave enabled</span>
                </>
              )}
            </div>
            <div className="text-gray-600">
              {progress.answeredRequiredQuestions} / {progress.requiredQuestions} required questions completed
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <AssessmentNavigation
            sections={definition.sections}
            activeSection={activeSection}
            sectionProgress={progress}
            formData={formData}
            onSectionClick={setActiveSection}
          />
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            {currentSection && (
              <Card>
                <CardContent className="p-8">
                  {/* Section Header */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {currentSection.title}
                      </h2>
                      <Badge variant="outline">
                        Section {currentSectionIndex + 1} of {definition.sections.length}
                      </Badge>
                    </div>
                    {currentSection.description && (
                      <p className="text-gray-600">{currentSection.description}</p>
                    )}
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    {currentSection.questions.map(question => (
                      <AssessmentQuestionRenderer
                        key={question.id}
                        question={question}
                        value={formData[question.id]}
                        onChange={(value) => handleQuestionChange(question.id, value)}
                        error={validationErrors[question.id]}
                        disabled={readOnly}
                      />
                    ))}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={handlePreviousSection}
                      disabled={isFirstSection}
                    >
                      Previous Section
                    </Button>

                    <div className="flex items-center gap-3">
                      {!readOnly && (
                        <Button
                          variant="outline"
                          onClick={handleSaveManual}
                          disabled={saving}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save Draft'}
                        </Button>
                      )}

                      {isLastSection ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={submitting || !progress.readyForSubmission || readOnly}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {submitting ? 'Submitting...' : 'Submit Assessment'}
                        </Button>
                      ) : (
                        <Button onClick={handleNextSection}>
                          Next Section
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-medium text-gray-900">{progress.percentComplete}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              progress.readyForSubmission ? 'bg-green-600' : 'bg-blue-600'
            )}
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
}
