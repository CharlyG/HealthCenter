/**
 * Documentation Review Screen
 * 
 * Pre-submission review screen that summarizes completed visit documentation.
 * 
 * Features:
 * - Complete visit summary
 * - Patient info & visit details
 * - Section-by-section review
 * - Missing required fields highlighting
 * - Completion status for each section
 * - Preview of documentation content
 * - Edit, Submit, Save as Draft actions
 * - Validation warnings
 * - Compliance checklist
 * - Error prevention
 * 
 * Helps clinicians:
 * - Review all documentation before submit
 * - Identify missing required fields
 * - Ensure quality and completeness
 * - Avoid submission errors
 */

import { useState } from 'react';
import {
  FileText,
  User,
  Eye,
  Syringe,
  BookOpen,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Edit,
  Send,
  Save,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  XCircle,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type {
  VisitDocumentationData,
  DocumentationSection,
} from './SmartDocumentationEditor';

// ==================== VALIDATION UTILITIES ====================

interface ValidationResult {
  isValid: boolean;
  missingFields: Array<{
    section: DocumentationSection;
    field: string;
    label: string;
  }>;
  warnings: string[];
}

function validateDocumentation(data: VisitDocumentationData): ValidationResult {
  const missingFields: ValidationResult['missingFields'] = [];
  const warnings: string[] = [];

  // Patient Status validation
  if (!data.patient_status.overall_condition?.trim()) {
    missingFields.push({
      section: 'patient_status',
      field: 'overall_condition',
      label: 'Overall Condition',
    });
  }
  if (data.patient_status.vital_signs_stable === undefined) {
    missingFields.push({
      section: 'patient_status',
      field: 'vital_signs_stable',
      label: 'Vital Signs Status',
    });
  }
  if (data.patient_status.pain_level === undefined || data.patient_status.pain_level === null) {
    missingFields.push({
      section: 'patient_status',
      field: 'pain_level',
      label: 'Pain Level',
    });
  }

  // Clinical Observations validation
  if (!data.observations.respiratory?.trim()) {
    missingFields.push({
      section: 'observations',
      field: 'respiratory',
      label: 'Respiratory Assessment',
    });
  }
  if (!data.observations.cardiovascular?.trim()) {
    missingFields.push({
      section: 'observations',
      field: 'cardiovascular',
      label: 'Cardiovascular Assessment',
    });
  }

  // Interventions validation
  if (!data.interventions.skilled_nursing || data.interventions.skilled_nursing.length === 0) {
    missingFields.push({
      section: 'interventions',
      field: 'skilled_nursing',
      label: 'Skilled Nursing Interventions',
    });
  }

  // Patient Education validation
  if (!data.education.topics_taught || data.education.topics_taught.length === 0) {
    missingFields.push({
      section: 'education',
      field: 'topics_taught',
      label: 'Topics Taught',
    });
  }
  if (!data.education.patient_understanding) {
    missingFields.push({
      section: 'education',
      field: 'patient_understanding',
      label: 'Patient Understanding',
    });
  }

  // Plan Updates validation
  if (!data.plan_updates.goals_progress?.trim()) {
    missingFields.push({
      section: 'plan_updates',
      field: 'goals_progress',
      label: 'Goals Progress',
    });
  }
  if (!data.plan_updates.next_visit_focus?.trim()) {
    missingFields.push({
      section: 'plan_updates',
      field: 'next_visit_focus',
      label: 'Next Visit Focus',
    });
  }

  // Warnings for recommended but not required fields
  if (!data.patient_status.functional_status?.trim()) {
    warnings.push('Functional status not documented');
  }
  if (!data.patient_status.mental_status?.trim()) {
    warnings.push('Mental status not documented');
  }
  if (data.patient_status.pain_level > 5 && !data.interventions.skilled_nursing.some(i => i.toLowerCase().includes('pain'))) {
    warnings.push('High pain level reported but no pain management intervention documented');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

// ==================== SECTION SUMMARY COMPONENTS ====================

interface SectionSummaryProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: boolean;
  children: React.ReactNode;
}

function SectionSummary({ title, icon: Icon, isComplete, children }: SectionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`border-2 ${isComplete ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`size-5 ${isComplete ? 'text-green-600' : 'text-red-600'}`} />
            <CardTitle className="text-base">{title}</CardTitle>
            {isComplete ? (
              <Badge className="bg-green-600">Complete</Badge>
            ) : (
              <Badge variant="destructive">Incomplete</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// ==================== MAIN REVIEW SCREEN ====================

interface DocumentationReviewScreenProps {
  data: VisitDocumentationData;
  onEdit: (section?: DocumentationSection) => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  onCancel: () => void;
}

export default function DocumentationReviewScreen({
  data,
  onEdit,
  onSubmit,
  onSaveDraft,
  onCancel,
}: DocumentationReviewScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validation = validateDocumentation(data);

  const handleSubmit = () => {
    if (!validation.isValid) {
      return;
    }
    setIsSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      onSubmit();
      setIsSubmitting(false);
    }, 1000);
  };

  // Calculate section completion
  const patientStatusComplete = 
    !!data.patient_status.overall_condition?.trim() &&
    data.patient_status.vital_signs_stable !== undefined &&
    data.patient_status.pain_level !== undefined;

  const observationsComplete = 
    !!data.observations.respiratory?.trim() &&
    !!data.observations.cardiovascular?.trim();

  const interventionsComplete = 
    data.interventions.skilled_nursing.length > 0;

  const educationComplete = 
    data.education.topics_taught.length > 0 &&
    !!data.education.patient_understanding;

  const planUpdatesComplete = 
    !!data.plan_updates.goals_progress?.trim() &&
    !!data.plan_updates.next_visit_focus?.trim();

  const allComplete = 
    patientStatusComplete &&
    observationsComplete &&
    interventionsComplete &&
    educationComplete &&
    planUpdatesComplete;

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="size-6 text-blue-600" />
              Review Documentation
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review your visit documentation before submitting
            </p>
          </div>
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="size-4 mr-2" />
            Back to Editor
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Visit Summary Card */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Info className="size-5" />
                Visit Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-blue-700 font-semibold mb-1">Patient</p>
                  <p className="text-sm text-blue-900 font-semibold">{data.patient_name}</p>
                  <p className="text-xs text-blue-700">ID: {data.patient_id}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-semibold mb-1">Visit Date</p>
                  <p className="text-sm text-blue-900 font-semibold">
                    {new Date(data.visit_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-blue-700">
                    {new Date(data.visit_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-semibold mb-1">Discipline</p>
                  <p className="text-sm text-blue-900 font-semibold">{data.discipline}</p>
                  <p className="text-xs text-blue-700">Visit ID: {data.visit_id}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-700 font-semibold mb-1">Status</p>
                  {allComplete ? (
                    <>
                      <p className="text-sm text-green-900 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-4" />
                        Ready to Submit
                      </p>
                      <p className="text-xs text-blue-700">All sections complete</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-red-900 font-semibold flex items-center gap-1">
                        <AlertCircle className="size-4" />
                        Incomplete
                      </p>
                      <p className="text-xs text-blue-700">
                        {validation.missingFields.length} fields missing
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Errors */}
          {!validation.isValid && (
            <Card className="border-2 border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <XCircle className="size-5" />
                  Missing Required Fields ({validation.missingFields.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validation.missingFields.map((field, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="size-4 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-red-900">{field.label}</p>
                          <p className="text-xs text-red-700">
                            Section: {field.section.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(field.section)}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        <Edit className="size-3 mr-1" />
                        Fix
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <Card className="border-2 border-yellow-300 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <AlertTriangle className="size-5" />
                  Recommendations ({validation.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validation.warnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                      <AlertTriangle className="size-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-900">{warning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section Reviews */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Documentation Sections</h2>

            {/* Patient Status */}
            <SectionSummary
              title="Patient Status"
              icon={User}
              isComplete={patientStatusComplete}
            >
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Overall Condition</p>
                  <p className="text-gray-900">
                    {data.patient_status.overall_condition || <span className="text-red-600 italic">Not documented</span>}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="font-semibold text-gray-700">Vital Signs</p>
                    <Badge className={data.patient_status.vital_signs_stable ? 'bg-green-600' : 'bg-red-600'}>
                      {data.patient_status.vital_signs_stable ? 'Stable' : 'Unstable'}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Pain Level</p>
                    <Badge className={
                      (data.patient_status.pain_level ?? 0) >= 7 ? 'bg-red-600' :
                      (data.patient_status.pain_level ?? 0) >= 4 ? 'bg-yellow-600' :
                      'bg-green-600'
                    }>
                      {data.patient_status.pain_level ?? 0}/10
                    </Badge>
                  </div>
                </div>
                {data.patient_status.changes_since_last_visit && (
                  <div>
                    <p className="font-semibold text-gray-700">Changes Since Last Visit</p>
                    <p className="text-gray-900">{data.patient_status.changes_since_last_visit}</p>
                  </div>
                )}
                {data.patient_status.functional_status && (
                  <div>
                    <p className="font-semibold text-gray-700">Functional Status</p>
                    <p className="text-gray-900">{data.patient_status.functional_status}</p>
                  </div>
                )}
                {data.patient_status.mental_status && (
                  <div>
                    <p className="font-semibold text-gray-700">Mental Status</p>
                    <p className="text-gray-900">{data.patient_status.mental_status}</p>
                  </div>
                )}
              </div>
            </SectionSummary>

            {/* Clinical Observations */}
            <SectionSummary
              title="Clinical Observations"
              icon={Eye}
              isComplete={observationsComplete}
            >
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Respiratory</p>
                  <p className="text-gray-900">
                    {data.observations.respiratory || <span className="text-red-600 italic">Not documented</span>}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Cardiovascular</p>
                  <p className="text-gray-900">
                    {data.observations.cardiovascular || <span className="text-red-600 italic">Not documented</span>}
                  </p>
                </div>
                {data.observations.skin_wound && (
                  <div>
                    <p className="font-semibold text-gray-700">Skin/Wound</p>
                    <p className="text-gray-900">{data.observations.skin_wound}</p>
                  </div>
                )}
                {data.observations.mobility && (
                  <div>
                    <p className="font-semibold text-gray-700">Mobility</p>
                    <p className="text-gray-900">{data.observations.mobility}</p>
                  </div>
                )}
                {data.observations.cognitive && (
                  <div>
                    <p className="font-semibold text-gray-700">Cognitive</p>
                    <p className="text-gray-900">{data.observations.cognitive}</p>
                  </div>
                )}
                {data.observations.other && (
                  <div>
                    <p className="font-semibold text-gray-700">Other Observations</p>
                    <p className="text-gray-900">{data.observations.other}</p>
                  </div>
                )}
              </div>
            </SectionSummary>

            {/* Interventions */}
            <SectionSummary
              title="Interventions"
              icon={Syringe}
              isComplete={interventionsComplete}
            >
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Skilled Nursing Interventions</p>
                  {data.interventions.skilled_nursing.length > 0 ? (
                    <ul className="space-y-1">
                      {data.interventions.skilled_nursing.map((intervention, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-900">{intervention}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-600 italic">No interventions documented</p>
                  )}
                </div>
                {data.interventions.medications_administered && data.interventions.medications_administered.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Medications Administered</p>
                    <ul className="space-y-1">
                      {data.interventions.medications_administered.map((med, index) => (
                        <li key={index} className="text-gray-900">• {med}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.interventions.treatments_performed && data.interventions.treatments_performed.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Treatments Performed</p>
                    <ul className="space-y-1">
                      {data.interventions.treatments_performed.map((treatment, index) => (
                        <li key={index} className="text-gray-900">• {treatment}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.interventions.equipment_issues && (
                  <div>
                    <p className="font-semibold text-gray-700">Equipment Issues</p>
                    <p className="text-gray-900">{data.interventions.equipment_issues}</p>
                  </div>
                )}
              </div>
            </SectionSummary>

            {/* Patient Education */}
            <SectionSummary
              title="Patient Education"
              icon={BookOpen}
              isComplete={educationComplete}
            >
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Topics Taught</p>
                  {data.education.topics_taught.length > 0 ? (
                    <ul className="space-y-1">
                      {data.education.topics_taught.map((topic, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <BookOpen className="size-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-900">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-red-600 italic">No topics documented</p>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Patient Understanding</p>
                  <Badge className={
                    data.education.patient_understanding === 'excellent' ? 'bg-green-600' :
                    data.education.patient_understanding === 'good' ? 'bg-blue-600' :
                    data.education.patient_understanding === 'fair' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }>
                    {data.education.patient_understanding?.charAt(0).toUpperCase() + data.education.patient_understanding?.slice(1)}
                  </Badge>
                </div>
                {data.education.barriers_to_learning && (
                  <div>
                    <p className="font-semibold text-gray-700">Barriers to Learning</p>
                    <p className="text-gray-900">{data.education.barriers_to_learning}</p>
                  </div>
                )}
                {data.education.caregiver_education && (
                  <div>
                    <p className="font-semibold text-gray-700">Caregiver Education</p>
                    <p className="text-gray-900">{data.education.caregiver_education}</p>
                  </div>
                )}
              </div>
            </SectionSummary>

            {/* Plan Updates */}
            <SectionSummary
              title="Plan Updates"
              icon={Target}
              isComplete={planUpdatesComplete}
            >
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Goals Progress</p>
                  <p className="text-gray-900">
                    {data.plan_updates.goals_progress || <span className="text-red-600 italic">Not documented</span>}
                  </p>
                </div>
                {data.plan_updates.plan_changes && (
                  <div>
                    <p className="font-semibold text-gray-700">Plan Changes</p>
                    <p className="text-gray-900">{data.plan_updates.plan_changes}</p>
                  </div>
                )}
                {data.plan_updates.orders_needed && (
                  <div>
                    <p className="font-semibold text-gray-700">Orders Needed</p>
                    <p className="text-gray-900">{data.plan_updates.orders_needed}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-700">Next Visit Focus</p>
                  <p className="text-gray-900">
                    {data.plan_updates.next_visit_focus || <span className="text-red-600 italic">Not documented</span>}
                  </p>
                </div>
                {data.plan_updates.discharge_planning && (
                  <div>
                    <p className="font-semibold text-gray-700">Discharge Planning</p>
                    <p className="text-gray-900">{data.plan_updates.discharge_planning}</p>
                  </div>
                )}
              </div>
            </SectionSummary>
          </div>

          {/* Compliance Checklist */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-blue-600" />
                Compliance Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <ChecklistItem
                  label="All required fields completed"
                  checked={validation.isValid}
                />
                <ChecklistItem
                  label="Patient status documented"
                  checked={patientStatusComplete}
                />
                <ChecklistItem
                  label="Clinical observations recorded"
                  checked={observationsComplete}
                />
                <ChecklistItem
                  label="Interventions documented"
                  checked={interventionsComplete}
                />
                <ChecklistItem
                  label="Patient education provided"
                  checked={educationComplete}
                />
                <ChecklistItem
                  label="Care plan updates documented"
                  checked={planUpdatesComplete}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => onEdit()}
              className="gap-2"
            >
              <Edit className="size-4" />
              Edit Documentation
            </Button>
            <Button
              variant="outline"
              onClick={onSaveDraft}
              className="gap-2"
            >
              <Save className="size-4" />
              Save as Draft
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {!validation.isValid && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="size-4" />
                <span className="font-semibold">
                  {validation.missingFields.length} required field{validation.missingFields.length !== 1 ? 's' : ''} missing
                </span>
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!validation.isValid || isSubmitting}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Submit Documentation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CHECKLIST ITEM ====================

interface ChecklistItemProps {
  label: string;
  checked: boolean;
}

function ChecklistItem({ label, checked }: ChecklistItemProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
      checked 
        ? 'border-green-200 bg-green-50' 
        : 'border-gray-200 bg-gray-50'
    }`}>
      {checked ? (
        <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
      ) : (
        <XCircle className="size-5 text-gray-400 flex-shrink-0" />
      )}
      <span className={`text-sm ${checked ? 'text-green-900 font-semibold' : 'text-gray-700'}`}>
        {label}
      </span>
    </div>
  );
}
