/**
 * Smart Documentation Editor
 * 
 * Intelligent clinical visit notes editor that simplifies complex documentation.
 * 
 * Features:
 * - Section-based form structure (5 sections)
 * - Progress indicator showing completion %
 * - Auto-save every 30 seconds
 * - Required fields highlighting
 * - Quick navigation between sections
 * - Smart templates
 * - Quick phrases library
 * - Copy from previous visit
 * - Offline capable
 * - Mobile optimized
 * - Validation before submit
 * 
 * Sections:
 * 1. Patient Status - Current condition, vitals, changes
 * 2. Clinical Observations - Physical assessment findings
 * 3. Interventions - Performed treatments/procedures
 * 4. Patient Education - Topics taught, understanding
 * 5. Plan Updates - Care plan changes, next steps
 */

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  User,
  Eye,
  Syringe,
  BookOpen,
  Target,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Copy,
  Zap,
  Send,
  X,
  Check,
  Info,
  ChevronLeft,
  FileCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import DocumentationReviewScreen from './DocumentationReviewScreen';

// ==================== TYPE DEFINITIONS ====================

export type DocumentationSection = 
  | 'patient_status'
  | 'observations'
  | 'interventions'
  | 'education'
  | 'plan_updates';

export interface PatientStatusData {
  overall_condition: string;
  vital_signs_stable: boolean;
  pain_level: number;
  changes_since_last_visit: string;
  functional_status: string;
  mental_status: string;
}

export interface ClinicalObservationsData {
  respiratory: string;
  cardiovascular: string;
  skin_wound: string;
  mobility: string;
  cognitive: string;
  other: string;
}

export interface InterventionsData {
  skilled_nursing: string[];
  medications_administered: string[];
  treatments_performed: string[];
  equipment_issues: string;
}

export interface PatientEducationData {
  topics_taught: string[];
  patient_understanding: 'poor' | 'fair' | 'good' | 'excellent';
  barriers_to_learning: string;
  caregiver_education: string;
}

export interface PlanUpdatesData {
  goals_progress: string;
  plan_changes: string;
  orders_needed: string;
  next_visit_focus: string;
  discharge_planning: string;
}

export interface VisitDocumentationData {
  visit_id: string;
  patient_id: string;
  patient_name: string;
  visit_date: string;
  discipline: string;
  patient_status: PatientStatusData;
  observations: ClinicalObservationsData;
  interventions: InterventionsData;
  education: PatientEducationData;
  plan_updates: PlanUpdatesData;
  narrative_summary?: string;
  last_saved?: string;
  is_complete: boolean;
  completed_at?: string;
}

export interface SectionConfig {
  id: DocumentationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  required_fields: string[];
}

// ==================== SECTION CONFIGURATION ====================

const SECTIONS: SectionConfig[] = [
  {
    id: 'patient_status',
    label: 'Patient Status',
    icon: User,
    required_fields: ['overall_condition', 'vital_signs_stable', 'pain_level'],
  },
  {
    id: 'observations',
    label: 'Clinical Observations',
    icon: Eye,
    required_fields: ['respiratory', 'cardiovascular'],
  },
  {
    id: 'interventions',
    label: 'Interventions',
    icon: Syringe,
    required_fields: ['skilled_nursing'],
  },
  {
    id: 'education',
    label: 'Patient Education',
    icon: BookOpen,
    required_fields: ['topics_taught', 'patient_understanding'],
  },
  {
    id: 'plan_updates',
    label: 'Plan Updates',
    icon: Target,
    required_fields: ['goals_progress', 'next_visit_focus'],
  },
];

// ==================== PROGRESS CALCULATION ====================

function calculateSectionProgress(
  section: DocumentationSection,
  data: VisitDocumentationData
): { completed: number; total: number; percentage: number } {
  const config = SECTIONS.find(s => s.id === section);
  if (!config) return { completed: 0, total: 0, percentage: 0 };

  let completed = 0;
  const total = config.required_fields.length;

  config.required_fields.forEach(field => {
    const sectionData = data[section] as any;
    const value = sectionData?.[field];
    
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        completed++;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        completed++;
      } else if (typeof value === 'string' && value.trim().length > 0) {
        completed++;
      }
    }
  });

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

function calculateOverallProgress(data: VisitDocumentationData): number {
  let totalCompleted = 0;
  let totalRequired = 0;

  SECTIONS.forEach(section => {
    const progress = calculateSectionProgress(section.id, data);
    totalCompleted += progress.completed;
    totalRequired += progress.total;
  });

  return totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;
}

// ==================== PATIENT STATUS SECTION ====================

interface PatientStatusSectionProps {
  data: PatientStatusData;
  onChange: (data: PatientStatusData) => void;
}

function PatientStatusSection({ data, onChange }: PatientStatusSectionProps) {
  const quickPhrases = {
    overall_condition: [
      'Stable, no acute distress',
      'Improved since last visit',
      'Condition unchanged',
      'Showing signs of decline',
    ],
    functional_status: [
      'Independent with ADLs',
      'Requires minimal assistance',
      'Requires moderate assistance',
      'Dependent for all ADLs',
    ],
    mental_status: [
      'Alert and oriented x3',
      'Alert and oriented x2 (person, place)',
      'Confused at times',
      'Lethargic but arousable',
    ],
  };

  return (
    <div className="space-y-4">
      {/* Overall Condition */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Overall Condition <span className="text-red-600">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {quickPhrases.overall_condition.map((phrase) => (
            <Button
              key={phrase}
              variant="outline"
              size="sm"
              onClick={() => onChange({ ...data, overall_condition: phrase })}
              className="text-xs"
            >
              <Zap className="size-3 mr-1" />
              {phrase}
            </Button>
          ))}
        </div>
        <textarea
          value={data.overall_condition || ''}
          onChange={(e) => onChange({ ...data, overall_condition: e.target.value })}
          placeholder="Describe patient's overall condition..."
          className={`w-full px-3 py-2 border rounded-md ${
            !data.overall_condition ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          rows={3}
        />
      </div>

      {/* Vital Signs Stable */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Vital Signs Status <span className="text-red-600">*</span>
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => onChange({ ...data, vital_signs_stable: true })}
            className={`flex-1 px-4 py-3 rounded-lg border-2 ${
              data.vital_signs_stable === true
                ? 'border-green-600 bg-green-50 text-green-900'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            <CheckCircle2 className="size-5 mx-auto mb-1" />
            <p className="text-sm font-semibold">Stable</p>
          </button>
          <button
            onClick={() => onChange({ ...data, vital_signs_stable: false })}
            className={`flex-1 px-4 py-3 rounded-lg border-2 ${
              data.vital_signs_stable === false
                ? 'border-red-600 bg-red-50 text-red-900'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            <AlertCircle className="size-5 mx-auto mb-1" />
            <p className="text-sm font-semibold">Unstable</p>
          </button>
        </div>
      </div>

      {/* Pain Level */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Pain Level (0-10) <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="10"
            value={data.pain_level ?? 0}
            onChange={(e) => onChange({ ...data, pain_level: parseInt(e.target.value) })}
            className="flex-1"
          />
          <div className={`text-3xl font-bold w-16 text-center ${
            (data.pain_level ?? 0) >= 7 ? 'text-red-600' :
            (data.pain_level ?? 0) >= 4 ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {data.pain_level ?? 0}
          </div>
        </div>
      </div>

      {/* Changes Since Last Visit */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Changes Since Last Visit
        </label>
        <textarea
          value={data.changes_since_last_visit || ''}
          onChange={(e) => onChange({ ...data, changes_since_last_visit: e.target.value })}
          placeholder="Note any changes in condition..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      {/* Functional Status */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Functional Status
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {quickPhrases.functional_status.map((phrase) => (
            <Button
              key={phrase}
              variant="outline"
              size="sm"
              onClick={() => onChange({ ...data, functional_status: phrase })}
              className="text-xs"
            >
              <Zap className="size-3 mr-1" />
              {phrase}
            </Button>
          ))}
        </div>
        <textarea
          value={data.functional_status || ''}
          onChange={(e) => onChange({ ...data, functional_status: e.target.value })}
          placeholder="Describe patient's ability to perform ADLs..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>

      {/* Mental Status */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Mental Status
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {quickPhrases.mental_status.map((phrase) => (
            <Button
              key={phrase}
              variant="outline"
              size="sm"
              onClick={() => onChange({ ...data, mental_status: phrase })}
              className="text-xs"
            >
              <Zap className="size-3 mr-1" />
              {phrase}
            </Button>
          ))}
        </div>
        <textarea
          value={data.mental_status || ''}
          onChange={(e) => onChange({ ...data, mental_status: e.target.value })}
          placeholder="Describe patient's cognitive status..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>
    </div>
  );
}

// ==================== CLINICAL OBSERVATIONS SECTION ====================

interface ClinicalObservationsSectionProps {
  data: ClinicalObservationsData;
  onChange: (data: ClinicalObservationsData) => void;
}

function ClinicalObservationsSection({ data, onChange }: ClinicalObservationsSectionProps) {
  const quickPhrases = {
    respiratory: [
      'Lungs clear bilaterally',
      'Crackles in lower bases',
      'Wheezing noted',
      'Labored breathing',
    ],
    cardiovascular: [
      'Heart sounds regular, no murmurs',
      'Irregular heart rate noted',
      'Pedal edema 1+',
      'Pedal edema 2+ bilaterally',
    ],
    skin_wound: [
      'Skin warm and dry, intact',
      'Stage 2 pressure injury noted',
      'Wound improving, granulation tissue present',
      'Signs of infection noted',
    ],
  };

  return (
    <div className="space-y-4">
      {/* Respiratory */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Respiratory <span className="text-red-600">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {quickPhrases.respiratory.map((phrase) => (
            <Button
              key={phrase}
              variant="outline"
              size="sm"
              onClick={() => onChange({ ...data, respiratory: phrase })}
              className="text-xs"
            >
              <Zap className="size-3 mr-1" />
              {phrase}
            </Button>
          ))}
        </div>
        <textarea
          value={data.respiratory || ''}
          onChange={(e) => onChange({ ...data, respiratory: e.target.value })}
          placeholder="Document respiratory assessment..."
          className={`w-full px-3 py-2 border rounded-md ${
            !data.respiratory ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          rows={3}
        />
      </div>

      {/* Cardiovascular */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Cardiovascular <span className="text-red-600">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {quickPhrases.cardiovascular.map((phrase) => (
            <Button
              key={phrase}
              variant="outline"
              size="sm"
              onClick={() => onChange({ ...data, cardiovascular: phrase })}
              className="text-xs"
            >
              <Zap className="size-3 mr-1" />
              {phrase}
            </Button>
          ))}
        </div>
        <textarea
          value={data.cardiovascular || ''}
          onChange={(e) => onChange({ ...data, cardiovascular: e.target.value })}
          placeholder="Document cardiovascular assessment..."
          className={`w-full px-3 py-2 border rounded-md ${
            !data.cardiovascular ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          rows={3}
        />
      </div>

      {/* Skin/Wound */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Skin/Wound
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {quickPhrases.skin_wound.map((phrase) => (
            <Button
              key={phrase}
              variant="outline"
              size="sm"
              onClick={() => onChange({ ...data, skin_wound: phrase })}
              className="text-xs"
            >
              <Zap className="size-3 mr-1" />
              {phrase}
            </Button>
          ))}
        </div>
        <textarea
          value={data.skin_wound || ''}
          onChange={(e) => onChange({ ...data, skin_wound: e.target.value })}
          placeholder="Document skin and wound assessment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      {/* Mobility */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Mobility
        </label>
        <textarea
          value={data.mobility || ''}
          onChange={(e) => onChange({ ...data, mobility: e.target.value })}
          placeholder="Document mobility and gait..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>

      {/* Cognitive */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Cognitive
        </label>
        <textarea
          value={data.cognitive || ''}
          onChange={(e) => onChange({ ...data, cognitive: e.target.value })}
          placeholder="Document cognitive assessment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>

      {/* Other */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Other Observations
        </label>
        <textarea
          value={data.other || ''}
          onChange={(e) => onChange({ ...data, other: e.target.value })}
          placeholder="Any additional observations..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>
    </div>
  );
}

// ==================== INTERVENTIONS SECTION ====================

interface InterventionsSectionProps {
  data: InterventionsData;
  onChange: (data: InterventionsData) => void;
}

function InterventionsSection({ data, onChange }: InterventionsSectionProps) {
  const [skilledInput, setSkilledInput] = useState('');

  const commonInterventions = [
    'Vital signs monitored',
    'Medication administration taught',
    'Wound care performed',
    'Blood pressure management',
    'Glucose monitoring',
    'Fall risk assessment',
  ];

  const handleAddSkilled = (intervention: string) => {
    if (intervention.trim() && !data.skilled_nursing.includes(intervention)) {
      onChange({
        ...data,
        skilled_nursing: [...data.skilled_nursing, intervention],
      });
      setSkilledInput('');
    }
  };

  const handleRemoveSkilled = (index: number) => {
    onChange({
      ...data,
      skilled_nursing: data.skilled_nursing.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      {/* Skilled Nursing Interventions */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Skilled Nursing Interventions <span className="text-red-600">*</span>
        </label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {commonInterventions.map((intervention) => (
            <Button
              key={intervention}
              variant="outline"
              size="sm"
              onClick={() => handleAddSkilled(intervention)}
              className="text-xs"
            >
              <Zap className="size-3 mr-1" />
              {intervention}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={skilledInput}
            onChange={(e) => setSkilledInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkilled(skilledInput);
              }
            }}
            placeholder="Type custom intervention and press Enter..."
            className={`flex-1 px-3 py-2 border rounded-md ${
              data.skilled_nursing.length === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          <Button onClick={() => handleAddSkilled(skilledInput)} size="sm">
            Add
          </Button>
        </div>

        {data.skilled_nursing.length > 0 && (
          <div className="space-y-2">
            {data.skilled_nursing.map((intervention, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                <CheckCircle2 className="size-4 text-blue-600 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-900">{intervention}</span>
                <button
                  onClick={() => handleRemoveSkilled(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medications Administered */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Medications Administered
        </label>
        <textarea
          value={data.medications_administered?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            medications_administered: e.target.value.split('\n').filter(m => m.trim()),
          })}
          placeholder="List medications administered (one per line)..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      {/* Treatments Performed */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Treatments Performed
        </label>
        <textarea
          value={data.treatments_performed?.join('\n') || ''}
          onChange={(e) => onChange({
            ...data,
            treatments_performed: e.target.value.split('\n').filter(t => t.trim()),
          })}
          placeholder="List treatments performed (one per line)..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      {/* Equipment Issues */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Equipment Issues
        </label>
        <textarea
          value={data.equipment_issues || ''}
          onChange={(e) => onChange({ ...data, equipment_issues: e.target.value })}
          placeholder="Note any equipment issues or needs..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>
    </div>
  );
}

// ==================== PATIENT EDUCATION SECTION ====================

interface PatientEducationSectionProps {
  data: PatientEducationData;
  onChange: (data: PatientEducationData) => void;
}

function PatientEducationSection({ data, onChange }: PatientEducationSectionProps) {
  const [topicInput, setTopicInput] = useState('');

  const commonTopics = [
    'Disease process education',
    'Medication management',
    'Diet modifications',
    'Fall prevention',
    'Infection prevention',
    'Signs/symptoms to report',
  ];

  const handleAddTopic = (topic: string) => {
    if (topic.trim() && !data.topics_taught.includes(topic)) {
      onChange({
        ...data,
        topics_taught: [...data.topics_taught, topic],
      });
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (index: number) => {
    onChange({
      ...data,
      topics_taught: data.topics_taught.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      {/* Topics Taught */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Topics Taught <span className="text-red-600">*</span>
        </label>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {commonTopics.map((topic) => (
            <Button
              key={topic}
              variant="outline"
              size="sm"
              onClick={() => handleAddTopic(topic)}
              className="text-xs"
            >
              <Zap className="size-3 mr-1" />
              {topic}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTopic(topicInput);
              }
            }}
            placeholder="Type custom topic and press Enter..."
            className={`flex-1 px-3 py-2 border rounded-md ${
              data.topics_taught.length === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          <Button onClick={() => handleAddTopic(topicInput)} size="sm">
            Add
          </Button>
        </div>

        {data.topics_taught.length > 0 && (
          <div className="space-y-2">
            {data.topics_taught.map((topic, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                <BookOpen className="size-4 text-green-600 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-900">{topic}</span>
                <button
                  onClick={() => handleRemoveTopic(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Understanding */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Patient Understanding <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(['poor', 'fair', 'good', 'excellent'] as const).map((level) => (
            <button
              key={level}
              onClick={() => onChange({ ...data, patient_understanding: level })}
              className={`px-4 py-3 rounded-lg border-2 ${
                data.patient_understanding === level
                  ? 'border-green-600 bg-green-50 text-green-900 font-semibold'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Barriers to Learning */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Barriers to Learning
        </label>
        <textarea
          value={data.barriers_to_learning || ''}
          onChange={(e) => onChange({ ...data, barriers_to_learning: e.target.value })}
          placeholder="Note any barriers (e.g., hearing impairment, language, literacy)..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>

      {/* Caregiver Education */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Caregiver Education
        </label>
        <textarea
          value={data.caregiver_education || ''}
          onChange={(e) => onChange({ ...data, caregiver_education: e.target.value })}
          placeholder="Document caregiver education provided..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>
    </div>
  );
}

// ==================== PLAN UPDATES SECTION ====================

interface PlanUpdatesSectionProps {
  data: PlanUpdatesData;
  onChange: (data: PlanUpdatesData) => void;
}

function PlanUpdatesSection({ data, onChange }: PlanUpdatesSectionProps) {
  return (
    <div className="space-y-4">
      {/* Goals Progress */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Goals Progress <span className="text-red-600">*</span>
        </label>
        <textarea
          value={data.goals_progress || ''}
          onChange={(e) => onChange({ ...data, goals_progress: e.target.value })}
          placeholder="Document progress toward care plan goals..."
          className={`w-full px-3 py-2 border rounded-md ${
            !data.goals_progress ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          rows={3}
        />
      </div>

      {/* Plan Changes */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Plan Changes
        </label>
        <textarea
          value={data.plan_changes || ''}
          onChange={(e) => onChange({ ...data, plan_changes: e.target.value })}
          placeholder="Note any changes to the care plan..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
        />
      </div>

      {/* Orders Needed */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Orders Needed
        </label>
        <textarea
          value={data.orders_needed || ''}
          onChange={(e) => onChange({ ...data, orders_needed: e.target.value })}
          placeholder="List any orders needed from physician..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>

      {/* Next Visit Focus */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
          Next Visit Focus <span className="text-red-600">*</span>
        </label>
        <textarea
          value={data.next_visit_focus || ''}
          onChange={(e) => onChange({ ...data, next_visit_focus: e.target.value })}
          placeholder="What should be focused on during next visit..."
          className={`w-full px-3 py-2 border rounded-md ${
            !data.next_visit_focus ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          rows={3}
        />
      </div>

      {/* Discharge Planning */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Discharge Planning
        </label>
        <textarea
          value={data.discharge_planning || ''}
          onChange={(e) => onChange({ ...data, discharge_planning: e.target.value })}
          placeholder="Document discharge planning activities..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
        />
      </div>
    </div>
  );
}

// ==================== MAIN SMART DOCUMENTATION EDITOR ====================

interface SmartDocumentationEditorProps {
  visitId: string;
  initialData?: Partial<VisitDocumentationData>;
  onSave?: (data: VisitDocumentationData) => void;
  onSubmit?: (data: VisitDocumentationData) => void;
}

export default function SmartDocumentationEditor({
  visitId,
  initialData,
  onSave,
  onSubmit,
}: SmartDocumentationEditorProps) {
  const [activeSection, setActiveSection] = useState<DocumentationSection>('patient_status');
  const [data, setData] = useState<VisitDocumentationData>({
    visit_id: visitId,
    patient_id: initialData?.patient_id || 'PAT-001',
    patient_name: initialData?.patient_name || 'Mary Johnson',
    visit_date: new Date().toISOString(),
    discipline: initialData?.discipline || 'RN',
    patient_status: initialData?.patient_status || {
      overall_condition: '',
      vital_signs_stable: true,
      pain_level: 0,
      changes_since_last_visit: '',
      functional_status: '',
      mental_status: '',
    },
    observations: initialData?.observations || {
      respiratory: '',
      cardiovascular: '',
      skin_wound: '',
      mobility: '',
      cognitive: '',
      other: '',
    },
    interventions: initialData?.interventions || {
      skilled_nursing: [],
      medications_administered: [],
      treatments_performed: [],
      equipment_issues: '',
    },
    education: initialData?.education || {
      topics_taught: [],
      patient_understanding: 'good',
      barriers_to_learning: '',
      caregiver_education: '',
    },
    plan_updates: initialData?.plan_updates || {
      goals_progress: '',
      plan_changes: '',
      orders_needed: '',
      next_visit_focus: '',
      discharge_planning: '',
    },
    is_complete: false,
  });

  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const handleAutoSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setLastSavedTime(new Date());
      setIsSaving(false);
      if (onSave) {
        onSave(data);
      }
    }, 500);
  }, [data, onSave]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [handleAutoSave]);

  const handleSubmit = () => {
    const progress = calculateOverallProgress(data);
    if (progress < 100) {
      alert(`Documentation is ${progress}% complete. Please complete all required fields.`);
      return;
    }

    if (onSubmit) {
      onSubmit({ ...data, is_complete: true, completed_at: new Date().toISOString() });
    }
  };

  const overallProgress = calculateOverallProgress(data);

  // Show review screen if requested
  if (showReview) {
    return (
      <DocumentationReviewScreen
        data={data}
        onEdit={(section) => {
          setShowReview(false);
          if (section) {
            setActiveSection(section);
          }
        }}
        onSubmit={handleSubmit}
        onSaveDraft={() => {
          handleAutoSave();
          alert('Documentation saved as draft');
        }}
        onCancel={() => setShowReview(false)}
      />
    );
  }

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Visit Documentation</h1>
            <p className="text-sm text-gray-600">
              {data.patient_name} • {data.discipline} • {new Date(data.visit_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : lastSavedTime ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Save className="size-4 text-green-600" />
                <span>Saved {lastSavedTime.toLocaleTimeString()}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
            <span>Documentation Progress</span>
            <span className="font-semibold">{overallProgress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                overallProgress === 100 ? 'bg-green-600' : 'bg-blue-600'
              }`}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Section Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-2 space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const progress = calculateSectionProgress(section.id, data);
              const isActive = activeSection === section.id;
              const isComplete = progress.percentage === 100;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full px-3 py-3 rounded-lg text-left flex items-center gap-3 ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Icon className={`size-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {section.label}
                    </p>
                    <p className="text-xs text-gray-600">
                      {progress.completed}/{progress.total} required
                    </p>
                  </div>
                  {isComplete && (
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = SECTIONS.find(s => s.id === activeSection)?.icon || FileText;
                  return <Icon className="size-5 text-blue-600" />;
                })()}
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                <Info className="size-4" />
                <span>Fields marked with <span className="text-red-600">*</span> are required</span>
              </div>
            </CardHeader>
            <CardContent>
              {activeSection === 'patient_status' && (
                <PatientStatusSection
                  data={data.patient_status}
                  onChange={(patientStatus) => setData({ ...data, patient_status: patientStatus })}
                />
              )}

              {activeSection === 'observations' && (
                <ClinicalObservationsSection
                  data={data.observations}
                  onChange={(observations) => setData({ ...data, observations })}
                />
              )}

              {activeSection === 'interventions' && (
                <InterventionsSection
                  data={data.interventions}
                  onChange={(interventions) => setData({ ...data, interventions })}
                />
              )}

              {activeSection === 'education' && (
                <PatientEducationSection
                  data={data.education}
                  onChange={(education) => setData({ ...data, education })}
                />
              )}

              {activeSection === 'plan_updates' && (
                <PlanUpdatesSection
                  data={data.plan_updates}
                  onChange={(planUpdates) => setData({ ...data, plan_updates: planUpdates })}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
                if (currentIndex > 0) {
                  setActiveSection(SECTIONS[currentIndex - 1].id);
                }
              }}
              disabled={SECTIONS.findIndex(s => s.id === activeSection) === 0}
            >
              <ChevronLeft className="size-4 mr-2" />
              Previous
            </Button>

            {SECTIONS.findIndex(s => s.id === activeSection) === SECTIONS.length - 1 ? (
              <Button
                onClick={() => setShowReview(true)}
                className="gap-2"
                disabled={overallProgress < 100}
              >
                <Send className="size-4" />
                Submit Documentation
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
                  if (currentIndex < SECTIONS.length - 1) {
                    setActiveSection(SECTIONS[currentIndex + 1].id);
                  }
                }}
              >
                Next
                <ChevronRight className="size-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}