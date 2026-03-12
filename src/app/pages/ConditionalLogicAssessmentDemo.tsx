/**
 * Conditional Logic Assessment Demo
 * 
 * Demonstrates dynamic question visibility based on conditional logic:
 * - Simple conditions (equals, not equals, includes, etc.)
 * - Complex conditions (AND, OR)
 * - Nested conditions
 * - Multiple question types
 * - Smooth animations for show/hide
 * 
 * Use cases:
 * - OASIS-E assessments
 * - Clinical screenings
 * - Patient intake forms
 * - Risk assessments
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Info,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type ConditionOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'includes' 
  | 'not_includes' 
  | 'greater_than' 
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty';

type LogicalOperator = 'AND' | 'OR';

interface Condition {
  questionId: string;
  operator: ConditionOperator;
  value?: any;
}

interface ConditionalRule {
  conditions: Condition[];
  logicalOperator?: LogicalOperator; // Default: AND
}

type QuestionType = 'radio' | 'checkbox' | 'select' | 'text' | 'textarea' | 'number' | 'date';

interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

interface Question {
  id: string;
  type: QuestionType;
  label: string;
  helpText?: string;
  required?: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  
  // Conditional logic
  conditionalRules?: ConditionalRule;
}

interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DEMO_ASSESSMENT: AssessmentSection[] = [
  {
    id: 'patient-status',
    title: 'Patient Status',
    description: 'General health status questions',
    questions: [
      {
        id: 'has_inpatient_stay',
        type: 'radio',
        label: 'Has the patient been admitted to an inpatient facility in the past 14 days?',
        helpText: 'M1000 - Inpatient Facility Admission',
        required: true,
        options: [
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
        ],
      },
      // Conditional: Only show if has_inpatient_stay = 'yes'
      {
        id: 'inpatient_facility_name',
        type: 'text',
        label: 'Name of Inpatient Facility',
        required: true,
        placeholder: 'Enter facility name',
        conditionalRules: {
          conditions: [
            { questionId: 'has_inpatient_stay', operator: 'equals', value: 'yes' }
          ],
        },
      },
      {
        id: 'inpatient_discharge_date',
        type: 'date',
        label: 'Discharge Date from Inpatient Facility',
        helpText: 'M1011 - Inpatient Discharge Date',
        required: true,
        conditionalRules: {
          conditions: [
            { questionId: 'has_inpatient_stay', operator: 'equals', value: 'yes' }
          ],
        },
      },
      {
        id: 'reason_for_hospitalization',
        type: 'textarea',
        label: 'Reason for Hospitalization',
        placeholder: 'Describe the reason for admission...',
        conditionalRules: {
          conditions: [
            { questionId: 'has_inpatient_stay', operator: 'equals', value: 'yes' }
          ],
        },
      },
    ],
  },
  {
    id: 'living-situation',
    title: 'Living Situation',
    description: 'Home environment and support',
    questions: [
      {
        id: 'living_arrangement',
        type: 'radio',
        label: 'M1100 - Patient Living Situation',
        required: true,
        options: [
          { value: 'alone', label: 'Patient lives alone', description: 'No other persons in home' },
          { value: 'with_others', label: 'Patient lives with other person(s)', description: 'Family or others in home' },
          { value: 'congregate', label: 'Patient lives in congregate situation', description: 'Assisted living, group home, etc.' },
        ],
      },
      // Conditional: Only show if living_arrangement = 'with_others'
      {
        id: 'household_members',
        type: 'checkbox',
        label: 'Who lives in the home with the patient?',
        options: [
          { value: 'spouse', label: 'Spouse/Partner' },
          { value: 'adult_children', label: 'Adult Children' },
          { value: 'minor_children', label: 'Minor Children' },
          { value: 'parents', label: 'Parents' },
          { value: 'siblings', label: 'Siblings' },
          { value: 'other_relatives', label: 'Other Relatives' },
          { value: 'non_relatives', label: 'Non-relatives' },
        ],
        conditionalRules: {
          conditions: [
            { questionId: 'living_arrangement', operator: 'equals', value: 'with_others' }
          ],
        },
      },
      {
        id: 'has_primary_caregiver',
        type: 'radio',
        label: 'Is there a primary caregiver?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
        conditionalRules: {
          conditions: [
            { questionId: 'living_arrangement', operator: 'equals', value: 'with_others' }
          ],
        },
      },
      // Nested conditional: Show only if living with others AND has primary caregiver
      {
        id: 'caregiver_name',
        type: 'text',
        label: 'Primary Caregiver Name',
        placeholder: 'Full name',
        conditionalRules: {
          conditions: [
            { questionId: 'living_arrangement', operator: 'equals', value: 'with_others' },
            { questionId: 'has_primary_caregiver', operator: 'equals', value: 'yes' },
          ],
          logicalOperator: 'AND',
        },
      },
      {
        id: 'caregiver_relationship',
        type: 'select',
        label: 'Relationship to Patient',
        options: [
          { value: 'spouse', label: 'Spouse/Partner' },
          { value: 'daughter', label: 'Daughter' },
          { value: 'son', label: 'Son' },
          { value: 'parent', label: 'Parent' },
          { value: 'sibling', label: 'Sibling' },
          { value: 'friend', label: 'Friend' },
          { value: 'other', label: 'Other' },
        ],
        conditionalRules: {
          conditions: [
            { questionId: 'living_arrangement', operator: 'equals', value: 'with_others' },
            { questionId: 'has_primary_caregiver', operator: 'equals', value: 'yes' },
          ],
          logicalOperator: 'AND',
        },
      },
      // Conditional for congregate living
      {
        id: 'facility_name',
        type: 'text',
        label: 'Facility Name',
        placeholder: 'Name of assisted living, group home, etc.',
        conditionalRules: {
          conditions: [
            { questionId: 'living_arrangement', operator: 'equals', value: 'congregate' }
          ],
        },
      },
    ],
  },
  {
    id: 'mobility',
    title: 'Mobility & Falls',
    description: 'Assessment of mobility and fall risk',
    questions: [
      {
        id: 'uses_assistive_devices',
        type: 'radio',
        label: 'Does the patient use assistive devices for mobility?',
        options: [
          { value: 'no', label: 'No assistive devices' },
          { value: 'yes', label: 'Yes, uses assistive devices' },
        ],
      },
      {
        id: 'assistive_devices',
        type: 'checkbox',
        label: 'Select all assistive devices used',
        options: [
          { value: 'cane', label: 'Cane' },
          { value: 'walker', label: 'Walker' },
          { value: 'wheelchair', label: 'Wheelchair' },
          { value: 'scooter', label: 'Scooter' },
          { value: 'crutches', label: 'Crutches' },
          { value: 'prosthetic', label: 'Prosthetic device' },
        ],
        conditionalRules: {
          conditions: [
            { questionId: 'uses_assistive_devices', operator: 'equals', value: 'yes' }
          ],
        },
      },
      {
        id: 'has_fall_history',
        type: 'radio',
        label: 'Has the patient fallen in the past 90 days?',
        options: [
          { value: 'no', label: 'No falls' },
          { value: 'yes', label: 'Yes, has fallen' },
        ],
      },
      {
        id: 'fall_count',
        type: 'number',
        label: 'Number of falls in past 90 days',
        placeholder: '0',
        conditionalRules: {
          conditions: [
            { questionId: 'has_fall_history', operator: 'equals', value: 'yes' }
          ],
        },
      },
      {
        id: 'fall_injury',
        type: 'radio',
        label: 'Did any falls result in injury?',
        options: [
          { value: 'no', label: 'No injury' },
          { value: 'minor', label: 'Minor injury (bruising, pain)' },
          { value: 'major', label: 'Major injury (fracture, laceration, head injury)' },
        ],
        conditionalRules: {
          conditions: [
            { questionId: 'has_fall_history', operator: 'equals', value: 'yes' }
          ],
        },
      },
      {
        id: 'injury_description',
        type: 'textarea',
        label: 'Describe the injury',
        placeholder: 'Provide details about the injury sustained...',
        conditionalRules: {
          conditions: [
            { questionId: 'fall_injury', operator: 'equals', value: 'minor' },
            { questionId: 'fall_injury', operator: 'equals', value: 'major' },
          ],
          logicalOperator: 'OR',
        },
      },
    ],
  },
  {
    id: 'medications',
    title: 'Medications',
    description: 'Current medications and compliance',
    questions: [
      {
        id: 'medication_count',
        type: 'select',
        label: 'How many medications is the patient currently taking?',
        options: [
          { value: 'none', label: 'None' },
          { value: '1-3', label: '1-3 medications' },
          { value: '4-6', label: '4-6 medications' },
          { value: '7-9', label: '7-9 medications' },
          { value: '10+', label: '10 or more medications' },
        ],
      },
      {
        id: 'medication_management',
        type: 'radio',
        label: 'Who manages the patient\'s medications?',
        options: [
          { value: 'self', label: 'Patient manages independently' },
          { value: 'caregiver', label: 'Caregiver manages' },
          { value: 'both', label: 'Patient and caregiver together' },
        ],
        conditionalRules: {
          conditions: [
            { questionId: 'medication_count', operator: 'not_equals', value: 'none' }
          ],
        },
      },
      {
        id: 'has_medication_issues',
        type: 'radio',
        label: 'Are there any medication management concerns?',
        options: [
          { value: 'no', label: 'No concerns' },
          { value: 'yes', label: 'Yes, there are concerns' },
        ],
        conditionalRules: {
          conditions: [
            { questionId: 'medication_count', operator: 'not_equals', value: 'none' }
          ],
        },
      },
      {
        id: 'medication_concerns',
        type: 'checkbox',
        label: 'Select all medication concerns',
        options: [
          { value: 'non_compliance', label: 'Non-compliance/missed doses' },
          { value: 'confusion', label: 'Confusion about medications' },
          { value: 'side_effects', label: 'Side effects' },
          { value: 'cost', label: 'Cost/affordability issues' },
          { value: 'access', label: 'Difficulty accessing pharmacy' },
          { value: 'poly_pharmacy', label: 'Polypharmacy concerns' },
        ],
        conditionalRules: {
          conditions: [
            { questionId: 'has_medication_issues', operator: 'equals', value: 'yes' }
          ],
        },
      },
      {
        id: 'medication_plan',
        type: 'textarea',
        label: 'Plan to address medication concerns',
        placeholder: 'Describe interventions planned...',
        conditionalRules: {
          conditions: [
            { questionId: 'has_medication_issues', operator: 'equals', value: 'yes' }
          ],
        },
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// CONDITIONAL LOGIC ENGINE
// ═══════════════════════════════════════════════════════════════════════════

function evaluateCondition(
  condition: Condition,
  responses: Record<string, any>
): boolean {
  const responseValue = responses[condition.questionId];

  switch (condition.operator) {
    case 'equals':
      return responseValue === condition.value;
    
    case 'not_equals':
      return responseValue !== condition.value;
    
    case 'includes':
      if (Array.isArray(responseValue)) {
        return responseValue.includes(condition.value);
      }
      return responseValue === condition.value;
    
    case 'not_includes':
      if (Array.isArray(responseValue)) {
        return !responseValue.includes(condition.value);
      }
      return responseValue !== condition.value;
    
    case 'greater_than':
      return Number(responseValue) > Number(condition.value);
    
    case 'less_than':
      return Number(responseValue) < Number(condition.value);
    
    case 'is_empty':
      return !responseValue || responseValue === '' || (Array.isArray(responseValue) && responseValue.length === 0);
    
    case 'is_not_empty':
      return !(!responseValue || responseValue === '' || (Array.isArray(responseValue) && responseValue.length === 0));
    
    default:
      return false;
  }
}

function evaluateConditionalRule(
  rule: ConditionalRule,
  responses: Record<string, any>
): boolean {
  const logicalOp = rule.logicalOperator || 'AND';
  
  if (logicalOp === 'AND') {
    return rule.conditions.every(condition => evaluateCondition(condition, responses));
  } else {
    return rule.conditions.some(condition => evaluateCondition(condition, responses));
  }
}

function isQuestionVisible(
  question: Question,
  responses: Record<string, any>
): boolean {
  if (!question.conditionalRules) {
    return true; // No conditional rules = always visible
  }
  
  return evaluateConditionalRule(question.conditionalRules, responses);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function ConditionalLogicAssessmentDemo() {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [showDebugPanel, setShowDebugPanel] = useState(true);

  // Calculate visible questions
  const visibilityMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    
    DEMO_ASSESSMENT.forEach(section => {
      section.questions.forEach(question => {
        map[question.id] = isQuestionVisible(question, responses);
      });
    });
    
    return map;
  }, [responses]);

  // Calculate progress
  const progress = useMemo(() => {
    const visibleQuestions = Object.entries(visibilityMap).filter(([_, visible]) => visible);
    const answeredQuestions = visibleQuestions.filter(([id]) => {
      const value = responses[id];
      return value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
    });
    
    return visibleQuestions.length > 0 
      ? Math.round((answeredQuestions.length / visibleQuestions.length) * 100)
      : 0;
  }, [visibilityMap, responses]);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleReset = () => {
    setResponses({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Conditional Logic Assessment Demo
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Questions appear and hide dynamically based on your responses
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebugPanel(!showDebugPanel)}
              >
                {showDebugPanel ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showDebugPanel ? 'Hide' : 'Show'} Debug
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-gray-900">{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Assessment */}
          <div className={cn('space-y-6', showDebugPanel ? 'col-span-8' : 'col-span-12')}>
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                <strong>Interactive Demo:</strong> Answer questions to see conditional logic in action. 
                Questions will appear and disappear based on your responses.
              </AlertDescription>
            </Alert>

            {DEMO_ASSESSMENT.map(section => (
              <AssessmentSectionCard
                key={section.id}
                section={section}
                responses={responses}
                visibilityMap={visibilityMap}
                onResponseChange={handleResponseChange}
              />
            ))}
          </div>

          {/* Debug Panel */}
          {showDebugPanel && (
            <div className="col-span-4">
              <div className="sticky top-24">
                <DebugPanel
                  responses={responses}
                  visibilityMap={visibilityMap}
                  assessment={DEMO_ASSESSMENT}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT SECTION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface AssessmentSectionCardProps {
  section: AssessmentSection;
  responses: Record<string, any>;
  visibilityMap: Record<string, boolean>;
  onResponseChange: (questionId: string, value: any) => void;
}

function AssessmentSectionCard({
  section,
  responses,
  visibilityMap,
  onResponseChange,
}: AssessmentSectionCardProps) {
  const visibleQuestionsCount = section.questions.filter(q => visibilityMap[q.id]).length;
  const answeredQuestionsCount = section.questions.filter(q => {
    if (!visibilityMap[q.id]) return false;
    const value = responses[q.id];
    return value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0);
  }).length;

  return (
    <Card className="p-6">
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
          <Badge variant="outline" className="text-xs">
            {answeredQuestionsCount}/{visibleQuestionsCount} answered
          </Badge>
        </div>
        {section.description && (
          <p className="text-sm text-gray-600">{section.description}</p>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {section.questions.map(question => (
          <QuestionField
            key={question.id}
            question={question}
            value={responses[question.id]}
            visible={visibilityMap[question.id]}
            onChange={(value) => onResponseChange(question.id, value)}
          />
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUESTION FIELD
// ═══════════════════════════════════════════════════════════════════════════

interface QuestionFieldProps {
  question: Question;
  value: any;
  visible: boolean;
  onChange: (value: any) => void;
}

function QuestionField({ question, value, visible, onChange }: QuestionFieldProps) {
  if (!visible) {
    return null;
  }

  return (
    <div 
      className={cn(
        'p-4 border-2 rounded-lg transition-all duration-300 animate-in slide-in-from-top-2 fade-in',
        question.conditionalRules 
          ? 'border-blue-200 bg-blue-50/30' 
          : 'border-gray-200'
      )}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            {question.label}
            {question.required && <span className="text-red-600">*</span>}
            {question.conditionalRules && (
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                <Zap className="w-3 h-3 mr-1" />
                Conditional
              </Badge>
            )}
          </Label>
          {question.helpText && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <HelpCircle className="w-3 h-3" />
              <span>{question.helpText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Question Input */}
      <div className="mt-3">
        {question.type === 'radio' && (
          <RadioGroup value={value} onValueChange={onChange}>
            <div className="space-y-2">
              {question.options?.map(option => (
                <div 
                  key={option.value} 
                  className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                  <Label 
                    htmlFor={`${question.id}-${option.value}`} 
                    className="cursor-pointer flex-1"
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-600 mt-0.5">{option.description}</div>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {question.type === 'checkbox' && (
          <div className="space-y-2">
            {question.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox
                  id={`${question.id}-${option.value}`}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(currentValues.filter((v: string) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer flex-1">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}

        {question.type === 'select' && (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {question.type === 'text' && (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
          />
        )}

        {question.type === 'textarea' && (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={3}
          />
        )}

        {question.type === 'number' && (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
          />
        )}

        {question.type === 'date' && (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DEBUG PANEL
// ═══════════════════════════════════════════════════════════════════════════

interface DebugPanelProps {
  responses: Record<string, any>;
  visibilityMap: Record<string, boolean>;
  assessment: AssessmentSection[];
}

function DebugPanel({ responses, visibilityMap, assessment }: DebugPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const totalQuestions = assessment.reduce((sum, section) => sum + section.questions.length, 0);
  const visibleQuestions = Object.values(visibilityMap).filter(Boolean).length;
  const hiddenQuestions = totalQuestions - visibleQuestions;

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">Debug Panel</h3>
        <p className="text-xs text-gray-600">
          Real-time view of conditional logic evaluation
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-xs text-green-700 mb-1">Visible</div>
          <div className="text-2xl font-bold text-green-900">{visibleQuestions}</div>
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-xs text-gray-700 mb-1">Hidden</div>
          <div className="text-2xl font-bold text-gray-900">{hiddenQuestions}</div>
        </div>
      </div>

      {/* Current Responses */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Current Responses</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {Object.entries(responses).length === 0 ? (
            <div className="text-xs text-gray-500 italic">No responses yet</div>
          ) : (
            Object.entries(responses).map(([key, value]) => (
              <div key={key} className="p-2 bg-gray-50 rounded text-xs">
                <div className="font-mono text-gray-700 mb-1">{key}</div>
                <div className="font-mono text-gray-900">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Question Visibility */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Question Visibility</h4>
        <div className="space-y-2">
          {assessment.map(section => (
            <div key={section.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs font-medium text-gray-900">{section.title}</span>
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
              
              {expandedSections.has(section.id) && (
                <div className="p-2 space-y-1">
                  {section.questions.map(question => {
                    const isVisible = visibilityMap[question.id];
                    return (
                      <div
                        key={question.id}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded text-xs',
                          isVisible ? 'bg-green-50' : 'bg-gray-50'
                        )}
                      >
                        {isVisible ? (
                          <Eye className="w-3 h-3 text-green-600 flex-shrink-0" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={cn(
                          'font-mono flex-1 truncate',
                          isVisible ? 'text-green-900' : 'text-gray-500'
                        )}>
                          {question.id}
                        </span>
                        {question.conditionalRules && (
                          <Zap className="w-3 h-3 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
