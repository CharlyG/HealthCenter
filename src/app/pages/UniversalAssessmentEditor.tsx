/**
 * UNIVERSAL ASSESSMENT EDITOR
 * 
 * Single, reusable editor that works with ANY assessment configuration
 * Handles: PT, OT, ST, HHA, Wound Care, Skilled Nursing, OASIS-E, etc.
 * 
 * Usage: /assessment/:assessmentType/:id
 * Example: /assessment/physical-therapy/new
 * Example: /assessment/wound-care/123
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
  Droplet,
  User,
  Handshake,
} from 'lucide-react';
import { toast } from 'sonner';

// Import all assessment configurations
import { SKILLED_NURSING_CONFIGURATION } from '../config/assessments/skilledNursingConfig';
import { PHYSICAL_THERAPY_CONFIGURATION } from '../config/assessments/physicalTherapyConfig';
import { OCCUPATIONAL_THERAPY_CONFIGURATION } from '../config/assessments/occupationalTherapyConfig';
import { SPEECH_THERAPY_CONFIGURATION } from '../config/assessments/speechTherapyConfig';
import { HOME_HEALTH_AIDE_CONFIGURATION } from '../config/assessments/homeHealthAideConfig';
import { WOUND_CARE_CONFIGURATION } from '../config/assessments/woundCareConfig';

import type {
  AssessmentTypeConfiguration,
  AssessmentInstance,
  AssessmentAnswer,
  QuestionDefinition,
  SectionDefinition,
} from '../config/types/assessmentTypes';
import { useAssessmentAPI } from '../hooks/useAssessmentAPI';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

const ASSESSMENT_CONFIGS: Record<string, AssessmentTypeConfiguration> = {
  'skilled-nursing': SKILLED_NURSING_CONFIGURATION,
  'physical-therapy': PHYSICAL_THERAPY_CONFIGURATION,
  'occupational-therapy': OCCUPATIONAL_THERAPY_CONFIGURATION,
  'speech-therapy': SPEECH_THERAPY_CONFIGURATION,
  'home-health-aide': HOME_HEALTH_AIDE_CONFIGURATION,
  'wound-care': WOUND_CARE_CONFIGURATION,
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION ICONS MAPPING (Universal)
// ═══════════════════════════════════════════════════════════════════════════

const SECTION_ICONS: Record<string, any> = {
  'visit-info': Home,
  'visit-wound-info': Droplet,
  'vital-signs': Activity,
  'vitals-pain': Activity,
  'systems-assessment': Stethoscope,
  'medication-review': Pill,
  'safety-assessment': ShieldCheck,
  'education': GraduationCap,
  'interventions': Syringe,
  'poc-review': ClipboardCheck,
  'visit-summary': FileCheck,
  'rom-assessment': Activity,
  'strength-assessment': Activity,
  'balance-coordination': Activity,
  'gait-assessment': Activity,
  'functional-mobility': Activity,
  'goals-plan': FileCheck,
  'adl-assessment': User,
  'iadl-assessment': Handshake,
  'fine-motor-cognitive': Activity,
  'home-environment': Home,
  'swallowing-assessment': Activity,
  'speech-voice': Activity,
  'language-cognition': Activity,
  'communication-strategies': Activity,
  'personal-care': User,
  'dressing-assistance': User,
  'toileting-assistance': User,
  'nutrition-hydration': Activity,
  'mobility-assistance': Activity,
  'home-support': Home,
  'patient-observation': Activity,
  'wound-staging': Droplet,
  'measurements': Activity,
  'wound-bed': Droplet,
  'exudate': Droplet,
  'periwound': Droplet,
  'infection-signs': AlertTriangle,
  'treatment-interventions': Syringe,
  'healing-progress': CheckCircle2,
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function UniversalAssessmentEditor() {
  const { assessmentType, id } = useParams<{ assessmentType: string; id: string }>();
  const navigate = useNavigate();
  const { fetchAssessment, saveAssessment, submitAssessment } = useAssessmentAPI();
  
  // Get the appropriate configuration
  const config = assessmentType ? ASSESSMENT_CONFIGS[assessmentType] : null;

  // State
  const [assessment, setAssessment] = useState<AssessmentInstance | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Validate configuration exists
  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Assessment Type</h2>
          <p className="text-gray-600 mb-4">Assessment type "{assessmentType}" not found</p>
          <Button onClick={() => navigate('/assessment-workspace')}>
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  const sections = config.sections;
  const currentSection = sections[currentSectionIndex];

  // Load assessment data
  useEffect(() => {
    const loadAssessment = async () => {
      if (!id || id === 'new') {
        // Create new assessment instance
        const newAssessment: AssessmentInstance = {
          id: `${assessmentType}-${Date.now()}`,
          configId: config.id,
          patientId: 'demo-patient-001',
          visitId: `visit-${Date.now()}`,
          status: 'in-progress',
          answers: [],
          progress: 0,
          createdBy: 'current-user',
          startedAt: new Date().toISOString(),
        };
        setAssessment(newAssessment);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAssessment(id);
        setAssessment(data);
        
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
  }, [id, assessmentType]);

  // Auto-save effect
  useEffect(() => {
    if (!assessment || id === 'new') return;

    const timer = setTimeout(() => {
      handleSave(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [answers]);

  // Calculate progress
  const progress = useMemo(() => {
    const requiredQuestions = config.completionRequirements?.requiredQuestions || [];
    const answeredRequired = requiredQuestions.filter(qId => {
      const value = answers[qId];
      return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
    }).length;
    return Math.round((answeredRequired / requiredQuestions.length) * 100);
  }, [answers, config]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleSave = async (isAutoSave: boolean = false) => {
    if (!assessment) return;

    setIsSaving(true);
    try {
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

  const validateSection = (section: SectionDefinition): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    section.questions.forEach(question => {
      if (question.conditional) {
        const dependsOnValue = answers[question.conditional.dependsOn];
        const shouldShow = evaluateConditional(question.conditional.showWhen!, dependsOnValue);
        if (!shouldShow) return;
      }

      if (question.required && (answers[question.id] === undefined || answers[question.id] === '')) {
        errors[question.id] = 'This field is required';
        isValid = false;
      }

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

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleSubmitForSignature = async () => {
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
              <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Patient: Demo Patient | Date: {new Date().toLocaleDateString()}
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
              <Button onClick={() => handleSave(false)} disabled={isSaving} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
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
                        currentSectionIndex === index ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm flex-1 min-w-0 truncate">{section.title}</span>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  {(() => {
                    const Icon = SECTION_ICONS[currentSection.id] || FileText;
                    return <Icon className="w-6 h-6 text-blue-600" />;
                  })()}
                  <h2 className="text-xl font-bold text-gray-900">{currentSection.title}</h2>
                  <Badge variant="outline">Section {currentSectionIndex + 1} of {sections.length}</Badge>
                </div>
                {currentSection.description && (
                  <p className="text-sm text-gray-600">{currentSection.description}</p>
                )}
              </div>

              <div className="space-y-6">
                {currentSection.questions.map(question => {
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

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <Button onClick={handlePrevious} disabled={currentSectionIndex === 0} variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentSectionIndex === sections.length - 1 ? (
                  <Button onClick={handleSubmitForSignature} disabled={progress < 100} className="bg-green-600 hover:bg-green-700">
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
// QUESTION RENDERER
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
        return <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder} className={error ? 'border-red-500' : ''} />;

      case 'long-text':
        return <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder} rows={4} className={error ? 'border-red-500' : ''} />;

      case 'number':
        return <Input type="number" value={value || ''} onChange={(e) => onChange(parseFloat(e.target.value))} placeholder={question.placeholder} min={question.validation?.min} max={question.validation?.max} className={error ? 'border-red-500' : ''} />;

      case 'date':
        return <Input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} className={error ? 'border-red-500' : ''} />;

      case 'time':
        return <Input type="time" value={value || ''} onChange={(e) => onChange(e.target.value)} className={error ? 'border-red-500' : ''} />;

      case 'boolean':
        return (
          <div className="flex items-center gap-4">
            <Button onClick={() => onChange(true)} variant={value === true ? 'default' : 'outline'} size="sm">Yes</Button>
            <Button onClick={() => onChange(false)} variant={value === false ? 'default' : 'outline'} size="sm">No</Button>
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
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
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
                    const newValues = checked ? [...currentValues, option.value] : currentValues.filter(v => v !== option.value);
                    onChange(newValues);
                  }}
                  id={`${question.id}-${option.value}`}
                />
                <Label htmlFor={`${question.id}-${option.value}`} className="text-sm font-normal cursor-pointer">{option.label}</Label>
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
      {question.helpText && <p className="text-xs text-gray-500">{question.helpText}</p>}
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
