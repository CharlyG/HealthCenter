/**
 * SKILLED NURSING ASSESSMENT EDITOR
 * 
 * Full-featured editor for completing Skilled Nursing Visit Notes
 * Integrates with the Assessment Engine and backend storage
 * 
 * Features:
 * - Configuration-driven rendering
 * - Real-time validation
 * - Conditional logic
 * - Auto-save
 * - Progress tracking
 * - Section navigation
 * - Signature workflow
 * 
 * @version 1.0.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Save,
  ChevronRight,
  ChevronLeft,
  Home,
  Activity,
  Stethoscope,
  Pill,
  ShieldCheck,
  GraduationCap,
  Syringe,
  ClipboardCheck,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { SKILLED_NURSING_CONFIGURATION } from '../config/assessments/skilledNursingConfig';
import type {
  AssessmentInstance,
  AssessmentAnswer,
  QuestionDefinition,
  SectionDefinition,
} from '../config/types/assessmentTypes';
import { useAssessmentAPI } from '../hooks/useAssessmentAPI';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION ICONS MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const SECTION_ICONS: Record<string, any> = {
  'visit-info': Home,
  'vital-signs': Activity,
  'systems-assessment': Stethoscope,
  'medication-review': Pill,
  'safety-assessment': ShieldCheck,
  'education': GraduationCap,
  'interventions': Syringe,
  'poc-review': ClipboardCheck,
  'visit-summary': FileCheck,
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SkilledNursingAssessmentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchAssessment, saveAssessment, submitAssessment } = useAssessmentAPI();
  
  // State
  const [assessment, setAssessment] = useState<AssessmentInstance | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Get current section
  const sections = SKILLED_NURSING_CONFIGURATION.sections;
  const currentSection = sections[currentSectionIndex];

  // Load assessment data
  useEffect(() => {
    const loadAssessment = async () => {
      if (!id || id === 'new') {
        // Create new assessment instance
        const newAssessment: AssessmentInstance = {
          id: `sn-${Date.now()}`,
          configId: SKILLED_NURSING_CONFIGURATION.id,
          patientId: 'demo-patient-001', // TODO: Get from context
          visitId: `visit-${Date.now()}`,
          status: 'in-progress',
          answers: [],
          progress: 0,
          createdBy: 'current-user', // TODO: Get from auth
          startedAt: new Date().toISOString(),
        };
        setAssessment(newAssessment);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAssessment(id);
        setAssessment(data);
        
        // Convert answers array to map
        const answersMap: Record<string, any> = {};
        data.answers.forEach((answer: AssessmentAnswer) => {
          answersMap[answer.questionId] = answer.value;
        });
        setAnswers(answersMap);
      } catch (error) {
        console.error('Failed to load assessment:', error);
        toast.error('Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [id]);

  // Auto-save effect
  useEffect(() => {
    if (!assessment || id === 'new') return;

    const timer = setTimeout(() => {
      handleSave(true);
    }, 5000); // Auto-save every 5 seconds after changes

    return () => clearTimeout(timer);
  }, [answers]);

  // Calculate progress
  const progress = useMemo(() => {
    const config = SKILLED_NURSING_CONFIGURATION;
    const requiredQuestions = config.completionRequirements?.requiredQuestions || [];
    const answeredRequired = requiredQuestions.filter(qId => answers[qId] !== undefined && answers[qId] !== '').length;
    return Math.round((answeredRequired / requiredQuestions.length) * 100);
  }, [answers]);

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));

    // Clear validation error if exists
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Handle save
  const handleSave = async (isAutoSave: boolean = false) => {
    if (!assessment) return;

    setIsSaving(true);
    try {
      // Convert answers map to array
      const answersArray: AssessmentAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
        timestamp: new Date().toISOString(),
        answeredBy: assessment.createdBy,
      }));

      const updatedAssessment: AssessmentInstance = {
        ...assessment,
        answers: answersArray,
        progress,
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: assessment.createdBy,
      };

      await saveAssessment(updatedAssessment);
      setAssessment(updatedAssessment);
      setLastSaved(new Date());

      if (!isAutoSave) {
        toast.success('Assessment saved successfully');
      }
    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast.error('Failed to save assessment');
    } finally {
      setIsSaving(false);
    }
  };

  // Validate section
  const validateSection = (section: SectionDefinition): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    section.questions.forEach(question => {
      // Check if question should be shown based on conditional logic
      if (question.conditional) {
        const dependsOnValue = answers[question.conditional.dependsOn];
        const shouldShow = evaluateConditional(question.conditional.showWhen!, dependsOnValue);
        if (!shouldShow) return; // Skip validation if hidden
      }

      // Check required
      if (question.required && (answers[question.id] === undefined || answers[question.id] === '')) {
        errors[question.id] = 'This field is required';
        isValid = false;
      }

      // Check validation rules
      if (question.validation && answers[question.id] !== undefined) {
        const value = answers[question.id];
        const { min, max, minLength, maxLength } = question.validation;

        if (question.type === 'number') {
          if (min !== undefined && value < min) {
            errors[question.id] = `Value must be at least ${min}`;
            isValid = false;
          }
          if (max !== undefined && value > max) {
            errors[question.id] = `Value must be at most ${max}`;
            isValid = false;
          }
        }

        if (question.type === 'text' || question.type === 'long-text') {
          if (minLength !== undefined && value.length < minLength) {
            errors[question.id] = `Must be at least ${minLength} characters`;
            isValid = false;
          }
          if (maxLength !== undefined && value.length > maxLength) {
            errors[question.id] = `Must be at most ${maxLength} characters`;
            isValid = false;
          }
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  // Evaluate conditional logic
  const evaluateConditional = (showWhen: any, value: any): boolean => {
    if (showWhen.equals !== undefined) return value === showWhen.equals;
    if (showWhen.notEquals !== undefined) return value !== showWhen.notEquals;
    if (showWhen.greaterThan !== undefined) return value > showWhen.greaterThan;
    if (showWhen.lessThan !== undefined) return value < showWhen.lessThan;
    if (showWhen.includes !== undefined) return Array.isArray(value) && value.includes(showWhen.includes);
    if (showWhen.includesAny !== undefined) return Array.isArray(value) && showWhen.includesAny.some((v: string) => value.includes(v));
    if (showWhen.notEmpty !== undefined) return value !== undefined && value !== '';
    return true;
  };

  // Handle next section
  const handleNext = () => {
    if (!validateSection(currentSection)) {
      toast.error('Please complete all required fields before continuing');
      return;
    }

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      handleSave(true);
    }
  };

  // Handle previous section
  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  // Handle submit for signature
  const handleSubmitForSignature = async () => {
    // Validate all sections
    let allValid = true;
    sections.forEach(section => {
      if (!validateSection(section)) {
        allValid = false;
      }
    });

    if (!allValid) {
      toast.error('Please complete all required fields before submitting');
      return;
    }

    if (progress < 100) {
      toast.error('Assessment must be 100% complete before submitting for signature');
      return;
    }

    try {
      await handleSave();
      
      if (assessment) {
        const updatedAssessment: AssessmentInstance = {
          ...assessment,
          status: 'ready-for-signature',
          completedAt: new Date().toISOString(),
        };
        await submitAssessment(updatedAssessment);
        toast.success('Assessment submitted for signature');
        navigate('/assessment-workspace');
      }
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      toast.error('Failed to submit assessment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Assessment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {SKILLED_NURSING_CONFIGURATION.name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Patient: Demo Patient | Visit Date: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{progress}% Complete</div>
                {lastSaved && (
                  <div className="text-xs text-gray-500">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </div>
              <Button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                variant="outline"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Section Navigation */}
          <div className="col-span-3">
            <Card className="p-4 sticky top-28">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-1">
                {sections.map((section, index) => {
                  const Icon = SECTION_ICONS[section.id] || FileText;
                  const isCompleted = section.questions.every(q => {
                    if (!q.required) return true;
                    if (q.conditional) {
                      const dependsOnValue = answers[q.conditional.dependsOn];
                      const shouldShow = evaluateConditional(q.conditional.showWhen!, dependsOnValue);
                      if (!shouldShow) return true;
                    }
                    return answers[q.id] !== undefined && answers[q.id] !== '';
                  });

                  return (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSectionIndex(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        currentSectionIndex === index
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm flex-1 min-w-0 truncate">{section.title}</span>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content - Questions */}
          <div className="col-span-9">
            <Card className="p-6">
              {/* Section Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const Icon = SECTION_ICONS[currentSection.id] || FileText;
                    return <Icon className="w-6 h-6 text-blue-600" />;
                  })()}
                  <h2 className="text-xl font-bold text-gray-900">{currentSection.title}</h2>
                  <Badge variant="outline">
                    Section {currentSectionIndex + 1} of {sections.length}
                  </Badge>
                </div>
                {currentSection.description && (
                  <p className="text-sm text-gray-600">{currentSection.description}</p>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {currentSection.questions.map(question => {
                  // Check conditional logic
                  if (question.conditional) {
                    const dependsOnValue = answers[question.conditional.dependsOn];
                    const shouldShow = evaluateConditional(question.conditional.showWhen!, dependsOnValue);
                    if (!shouldShow) return null;
                  }

                  return (
                    <QuestionRenderer
                      key={question.id}
                      question={question}
                      value={answers[question.id]}
                      onChange={(value) => handleAnswerChange(question.id, value)}
                      error={validationErrors[question.id]}
                    />
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={handlePrevious}
                  disabled={currentSectionIndex === 0}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentSectionIndex === sections.length - 1 ? (
                  <Button
                    onClick={handleSubmitForSignature}
                    disabled={progress < 100}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Submit for Signature
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUESTION RENDERER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QuestionRendererProps {
  question: QuestionDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

function QuestionRenderer({ question, value, onChange, error }: QuestionRendererProps) {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'long-text':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            placeholder={question.placeholder}
            min={question.validation?.min}
            max={question.validation?.max}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'time':
        return (
          <Input
            type="time"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-4">
            <Button
              onClick={() => onChange(true)}
              variant={value === true ? 'default' : 'outline'}
              size="sm"
            >
              Yes
            </Button>
            <Button
              onClick={() => onChange(false)}
              variant={value === false ? 'default' : 'outline'}
              size="sm"
            >
              No
            </Button>
          </div>
        );

      case 'single-select':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multi-select':
        const currentValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <div key={option.value} className="flex items-center gap-2">
                <Checkbox
                  checked={currentValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    onChange(newValues);
                  }}
                  id={`${question.id}-${option.value}`}
                />
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return <div className="text-gray-500">Unsupported question type: {question.type}</div>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-gray-900">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {question.helpText && (
        <p className="text-xs text-gray-500">{question.helpText}</p>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
