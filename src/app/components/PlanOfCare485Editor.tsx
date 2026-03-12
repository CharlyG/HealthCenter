/**
 * Plan of Care / 485 Editor Component
 * 
 * Structured section-based editor for CMS 485 Plan of Care creation.
 * Includes progress tracking, validation, and contextual panels.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Save,
  Send,
  X,
  Calendar,
  Stethoscope,
  Users,
  Activity,
  AlertTriangle,
  Target,
  ClipboardList,
  FileText,
  Shield,
  Check,
  ChevronRight,
  AlertCircle,
  Clock,
  Pill,
  UserCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type PlanOfCareSection =
  | 'certification-period'
  | 'patient-diagnoses'
  | 'disciplines'
  | 'visit-frequency'
  | 'functional-limitations'
  | 'clinical-goals'
  | 'interventions'
  | 'orders'
  | 'safety-measures'
  | 'narrative-summary';

export interface PlanOfCare485Data {
  certificationPeriod: {
    startDate: string;
    endDate: string;
    certificationNumber: number;
  };
  patientDiagnoses: {
    primary: string;
    secondary: string[];
  };
  disciplines: string[];
  visitFrequency: {
    [discipline: string]: {
      frequency: string;
      duration: string;
    };
  };
  functionalLimitations: string[];
  clinicalGoals: {
    id: string;
    goal: string;
    targetDate: string;
  }[];
  interventions: {
    discipline: string;
    intervention: string;
  }[];
  orders: string[];
  safetyMeasures: string[];
  narrativeSummary: string;
}

interface SectionConfig {
  id: PlanOfCareSection;
  label: string;
  icon: any;
  required: boolean;
  description: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const SECTIONS: SectionConfig[] = [
  {
    id: 'certification-period',
    label: 'Certification Period',
    icon: Calendar,
    required: true,
    description: 'Start date, end date, and certification number',
  },
  {
    id: 'patient-diagnoses',
    label: 'Patient Diagnoses',
    icon: Stethoscope,
    required: true,
    description: 'Primary and secondary diagnoses with ICD-10 codes',
  },
  {
    id: 'disciplines',
    label: 'Disciplines Involved',
    icon: Users,
    required: true,
    description: 'Healthcare disciplines providing care',
  },
  {
    id: 'visit-frequency',
    label: 'Visit Frequency',
    icon: Activity,
    required: true,
    description: 'Visit schedule for each discipline',
  },
  {
    id: 'functional-limitations',
    label: 'Functional Limitations',
    icon: AlertTriangle,
    required: true,
    description: 'Patient functional status and limitations',
  },
  {
    id: 'clinical-goals',
    label: 'Clinical Goals',
    icon: Target,
    required: true,
    description: 'Measurable patient-centered goals',
  },
  {
    id: 'interventions',
    label: 'Interventions',
    icon: ClipboardList,
    required: true,
    description: 'Specific interventions by discipline',
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: FileText,
    required: true,
    description: 'Physician orders and treatments',
  },
  {
    id: 'safety-measures',
    label: 'Safety Measures',
    icon: Shield,
    required: false,
    description: 'Safety precautions and fall risk',
  },
  {
    id: 'narrative-summary',
    label: 'Narrative Summary',
    icon: FileText,
    required: true,
    description: 'Clinical overview and summary',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PlanOfCare485EditorProps {
  admissionId: string;
  patientName?: string;
  initialData?: Partial<PlanOfCare485Data>;
  onSave?: (data: PlanOfCare485Data) => void;
  onCancel?: () => void;
}

export default function PlanOfCare485Editor({
  admissionId,
  patientName = 'Margaret Johnson',
  initialData,
  onSave,
  onCancel,
}: PlanOfCare485EditorProps) {
  const [activeSection, setActiveSection] = useState<PlanOfCareSection>('certification-period');
  const [formData, setFormData] = useState<Partial<PlanOfCare485Data>>({
    certificationPeriod: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      certificationNumber: 1,
    },
    patientDiagnoses: {
      primary: '',
      secondary: [],
    },
    disciplines: [],
    visitFrequency: {},
    functionalLimitations: [],
    clinicalGoals: [],
    interventions: [],
    orders: [],
    safetyMeasures: [],
    narrativeSummary: '',
    ...initialData,
  });

  // Calculate section completion
  const sectionCompletion = useMemo(() => {
    const completion: Record<PlanOfCareSection, boolean> = {
      'certification-period': !!(
        formData.certificationPeriod?.startDate &&
        formData.certificationPeriod?.endDate
      ),
      'patient-diagnoses': !!(formData.patientDiagnoses?.primary),
      'disciplines': (formData.disciplines?.length || 0) > 0,
      'visit-frequency': Object.keys(formData.visitFrequency || {}).length > 0,
      'functional-limitations': (formData.functionalLimitations?.length || 0) > 0,
      'clinical-goals': (formData.clinicalGoals?.length || 0) > 0,
      'interventions': (formData.interventions?.length || 0) > 0,
      'orders': (formData.orders?.length || 0) > 0,
      'safety-measures': true, // Optional
      'narrative-summary': (formData.narrativeSummary?.length || 0) >= 50,
    };
    return completion;
  }, [formData]);

  const overallProgress = useMemo(() => {
    const completed = Object.values(sectionCompletion).filter(Boolean).length;
    return Math.round((completed / SECTIONS.length) * 100);
  }, [sectionCompletion]);

  const validationIssues = useMemo(() => {
    const issues: { section: PlanOfCareSection; message: string }[] = [];
    
    SECTIONS.forEach(section => {
      if (section.required && !sectionCompletion[section.id]) {
        issues.push({
          section: section.id,
          message: `${section.label} is required but incomplete`,
        });
      }
    });

    return issues;
  }, [sectionCompletion]);

  const handleSave = () => {
    onSave?.(formData as PlanOfCare485Data);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Plan of Care (CMS 485)</h2>
              <p className="text-sm text-gray-600 mt-1">
                {patientName} • Admission #{admissionId}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button variant="outline" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSave} disabled={validationIssues.length > 0}>
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Overall Progress</span>
              <span className="font-semibold text-blue-600">{overallProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section Navigation */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Sections
            </h3>
            <div className="space-y-1">
              {SECTIONS.map(section => {
                const SectionIcon = section.icon;
                const isComplete = sectionCompletion[section.id];
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <SectionIcon className={cn('w-4 h-4', isActive && 'text-blue-600')} />
                    <span className="flex-1 text-sm font-medium">{section.label}</span>
                    {section.required && (
                      isComplete ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      )
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center - Editor Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Validation Warnings */}
            {validationIssues.length > 0 && (
              <Card className="p-4 mb-6 bg-amber-50 border-amber-300">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-2">
                      {validationIssues.length} Required Section(s) Incomplete
                    </h4>
                    <ul className="space-y-1">
                      {validationIssues.map((issue, idx) => (
                        <li key={idx} className="text-sm text-amber-700">
                          • {issue.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* Section Content */}
            <SectionContent
              section={activeSection}
              formData={formData}
              onUpdate={setFormData}
            />
          </div>
        </div>

        {/* Right Sidebar - Contextual Panel */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <ContextualPanel admissionId={admissionId} patientName={patientName} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION CONTENT
// ═══════════════════════════════════════════════════════════════════════════

interface SectionContentProps {
  section: PlanOfCareSection;
  formData: Partial<PlanOfCare485Data>;
  onUpdate: (data: Partial<PlanOfCare485Data>) => void;
}

function SectionContent({ section, formData, onUpdate }: SectionContentProps) {
  const sectionConfig = SECTIONS.find(s => s.id === section);

  if (!sectionConfig) return null;

  const SectionIcon = sectionConfig.icon;

  return (
    <Card className="p-6">
      {/* Section Header */}
      <div className="flex items-start gap-4 mb-6 pb-6 border-b">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
          <SectionIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{sectionConfig.label}</h3>
            {sectionConfig.required && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                Required
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">{sectionConfig.description}</p>
        </div>
      </div>

      {/* Section-Specific Form */}
      {section === 'certification-period' && (
        <CertificationPeriodForm formData={formData} onUpdate={onUpdate} />
      )}
      {section === 'patient-diagnoses' && (
        <PatientDiagnosesForm formData={formData} onUpdate={onUpdate} />
      )}
      {section === 'disciplines' && (
        <DisciplinesForm formData={formData} onUpdate={onUpdate} />
      )}
      {section === 'visit-frequency' && (
        <VisitFrequencyForm formData={formData} onUpdate={onUpdate} />
      )}
      {section === 'functional-limitations' && (
        <FunctionalLimitationsForm formData={formData} onUpdate={onUpdate} />
      )}
      {section === 'clinical-goals' && (
        <ClinicalGoalsForm formData={formData} onUpdate={onUpdate} />
      )}
      {section === 'interventions' && (
        <InterventionsForm formData={formData} onUpdate={onUpdate} />
      )}
      {section === 'orders' && (
        <OrdersForm formData={formData} onUpdate={onUpdate} />
      )}
      {section === 'safety-measures' && (
        <SafetyMeasuresForm formData={formData} onUpdate={onUpdate} />
      )}
      {section === 'narrative-summary' && (
        <NarrativeSummaryForm formData={formData} onUpdate={onUpdate} />
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION FORMS
// ═══════════════════════════════════════════════════════════════════════════

function CertificationPeriodForm({ formData, onUpdate }: SectionContentProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <Input
            type="date"
            value={formData.certificationPeriod?.startDate || ''}
            onChange={e =>
              onUpdate({
                ...formData,
                certificationPeriod: {
                  ...formData.certificationPeriod!,
                  startDate: e.target.value,
                },
              })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <Input
            type="date"
            value={formData.certificationPeriod?.endDate || ''}
            onChange={e =>
              onUpdate({
                ...formData,
                certificationPeriod: {
                  ...formData.certificationPeriod!,
                  endDate: e.target.value,
                },
              })
            }
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certification Number
        </label>
        <Input
          type="number"
          value={formData.certificationPeriod?.certificationNumber || 1}
          onChange={e =>
            onUpdate({
              ...formData,
              certificationPeriod: {
                ...formData.certificationPeriod!,
                certificationNumber: parseInt(e.target.value),
              },
            })
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          Initial certification = 1, Recertification = 2, 3, etc.
        </p>
      </div>
    </div>
  );
}

function PatientDiagnosesForm({ formData, onUpdate }: SectionContentProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Diagnosis *
        </label>
        <Input
          placeholder="Enter primary diagnosis with ICD-10 code (e.g., I50.9 - Heart Failure)"
          value={formData.patientDiagnoses?.primary || ''}
          onChange={e =>
            onUpdate({
              ...formData,
              patientDiagnoses: {
                ...formData.patientDiagnoses!,
                primary: e.target.value,
              },
            })
          }
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Secondary Diagnoses
        </label>
        <textarea
          placeholder="Enter secondary diagnoses (one per line)"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.patientDiagnoses?.secondary?.join('\n') || ''}
          onChange={e =>
            onUpdate({
              ...formData,
              patientDiagnoses: {
                ...formData.patientDiagnoses!,
                secondary: e.target.value.split('\n').filter(Boolean),
              },
            })
          }
        />
      </div>
    </div>
  );
}

function DisciplinesForm({ formData, onUpdate }: SectionContentProps) {
  const availableDisciplines = [
    'Skilled Nursing',
    'Physical Therapy',
    'Occupational Therapy',
    'Speech Therapy',
    'Medical Social Work',
    'Home Health Aide',
  ];

  const toggleDiscipline = (discipline: string) => {
    const current = formData.disciplines || [];
    const updated = current.includes(discipline)
      ? current.filter(d => d !== discipline)
      : [...current, discipline];
    onUpdate({ ...formData, disciplines: updated });
  };

  return (
    <div className="space-y-3">
      {availableDisciplines.map(discipline => (
        <label
          key={discipline}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <input
            type="checkbox"
            checked={formData.disciplines?.includes(discipline)}
            onChange={() => toggleDiscipline(discipline)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="font-medium text-gray-900">{discipline}</span>
        </label>
      ))}
    </div>
  );
}

function VisitFrequencyForm({ formData, onUpdate }: SectionContentProps) {
  return (
    <div className="space-y-4">
      {formData.disciplines?.map(discipline => (
        <div key={discipline} className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">{discipline}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <Input
                placeholder="e.g., 3x per week"
                value={formData.visitFrequency?.[discipline]?.frequency || ''}
                onChange={e =>
                  onUpdate({
                    ...formData,
                    visitFrequency: {
                      ...formData.visitFrequency,
                      [discipline]: {
                        ...formData.visitFrequency?.[discipline],
                        frequency: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <Input
                placeholder="e.g., 4 weeks"
                value={formData.visitFrequency?.[discipline]?.duration || ''}
                onChange={e =>
                  onUpdate({
                    ...formData,
                    visitFrequency: {
                      ...formData.visitFrequency,
                      [discipline]: {
                        ...formData.visitFrequency?.[discipline],
                        duration: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      ))}
      {(!formData.disciplines || formData.disciplines.length === 0) && (
        <p className="text-sm text-gray-600 text-center py-4">
          Select disciplines first to set visit frequencies
        </p>
      )}
    </div>
  );
}

function FunctionalLimitationsForm({ formData, onUpdate }: SectionContentProps) {
  const commonLimitations = [
    'Ambulation',
    'Transferring',
    'Feeding',
    'Dressing',
    'Toileting',
    'Bathing',
    'Confined to bed',
    'Dyspnea with minimal exertion',
  ];

  const toggleLimitation = (limitation: string) => {
    const current = formData.functionalLimitations || [];
    const updated = current.includes(limitation)
      ? current.filter(l => l !== limitation)
      : [...current, limitation];
    onUpdate({ ...formData, functionalLimitations: updated });
  };

  return (
    <div className="space-y-3">
      {commonLimitations.map(limitation => (
        <label
          key={limitation}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <input
            type="checkbox"
            checked={formData.functionalLimitations?.includes(limitation)}
            onChange={() => toggleLimitation(limitation)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-900">{limitation}</span>
        </label>
      ))}
    </div>
  );
}

function ClinicalGoalsForm({ formData, onUpdate }: SectionContentProps) {
  const addGoal = () => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      goal: '',
      targetDate: '',
    };
    onUpdate({
      ...formData,
      clinicalGoals: [...(formData.clinicalGoals || []), newGoal],
    });
  };

  const removeGoal = (id: string) => {
    onUpdate({
      ...formData,
      clinicalGoals: formData.clinicalGoals?.filter(g => g.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      {formData.clinicalGoals?.map((goal, idx) => (
        <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">Goal {idx + 1}</span>
            <Button variant="ghost" size="sm" onClick={() => removeGoal(goal.id)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Description
              </label>
              <textarea
                placeholder="e.g., Patient will ambulate 50 feet with walker independently"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={goal.goal}
                onChange={e => {
                  const updated = formData.clinicalGoals?.map(g =>
                    g.id === goal.id ? { ...g, goal: e.target.value } : g
                  );
                  onUpdate({ ...formData, clinicalGoals: updated });
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <Input
                type="date"
                value={goal.targetDate}
                onChange={e => {
                  const updated = formData.clinicalGoals?.map(g =>
                    g.id === goal.id ? { ...g, targetDate: e.target.value } : g
                  );
                  onUpdate({ ...formData, clinicalGoals: updated });
                }}
              />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addGoal} className="w-full">
        <Target className="w-4 h-4 mr-2" />
        Add Clinical Goal
      </Button>
    </div>
  );
}

function InterventionsForm({ formData, onUpdate }: SectionContentProps) {
  const addIntervention = () => {
    const newIntervention = {
      discipline: formData.disciplines?.[0] || '',
      intervention: '',
    };
    onUpdate({
      ...formData,
      interventions: [...(formData.interventions || []), newIntervention],
    });
  };

  return (
    <div className="space-y-4">
      {formData.interventions?.map((item, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">Intervention {idx + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onUpdate({
                  ...formData,
                  interventions: formData.interventions?.filter((_, i) => i !== idx),
                });
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discipline
              </label>
              <select
                value={item.discipline}
                onChange={e => {
                  const updated = formData.interventions?.map((int, i) =>
                    i === idx ? { ...int, discipline: e.target.value } : int
                  );
                  onUpdate({ ...formData, interventions: updated });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formData.disciplines?.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervention
              </label>
              <textarea
                placeholder="Describe the specific intervention"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={item.intervention}
                onChange={e => {
                  const updated = formData.interventions?.map((int, i) =>
                    i === idx ? { ...int, intervention: e.target.value } : int
                  );
                  onUpdate({ ...formData, interventions: updated });
                }}
              />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addIntervention} className="w-full">
        <ClipboardList className="w-4 h-4 mr-2" />
        Add Intervention
      </Button>
    </div>
  );
}

function OrdersForm({ formData, onUpdate }: SectionContentProps) {
  return (
    <div>
      <textarea
        placeholder="Enter physician orders (one per line)"
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={formData.orders?.join('\n') || ''}
        onChange={e =>
          onUpdate({
            ...formData,
            orders: e.target.value.split('\n').filter(Boolean),
          })
        }
      />
    </div>
  );
}

function SafetyMeasuresForm({ formData, onUpdate }: SectionContentProps) {
  const commonMeasures = [
    'Fall risk precautions',
    'Non-slip footwear required',
    'Assistive device in reach',
    'Clear pathways',
    'Adequate lighting',
    'Emergency contact posted',
  ];

  const toggleMeasure = (measure: string) => {
    const current = formData.safetyMeasures || [];
    const updated = current.includes(measure)
      ? current.filter(m => m !== measure)
      : [...current, measure];
    onUpdate({ ...formData, safetyMeasures: updated });
  };

  return (
    <div className="space-y-3">
      {commonMeasures.map(measure => (
        <label
          key={measure}
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
        >
          <input
            type="checkbox"
            checked={formData.safetyMeasures?.includes(measure)}
            onChange={() => toggleMeasure(measure)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-gray-900">{measure}</span>
        </label>
      ))}
    </div>
  );
}

function NarrativeSummaryForm({ formData, onUpdate }: SectionContentProps) {
  return (
    <div>
      <textarea
        placeholder="Provide a narrative summary of the patient's clinical status, progress, and plan of care..."
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={formData.narrativeSummary || ''}
        onChange={e => onUpdate({ ...formData, narrativeSummary: e.target.value })}
      />
      <p className="text-xs text-gray-500 mt-1">
        {formData.narrativeSummary?.length || 0} characters (minimum 50 recommended)
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXTUAL PANEL
// ═══════════════════════════════════════════════════════════════════════════

function ContextualPanel({ admissionId, patientName }: { admissionId: string; patientName: string }) {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase">Context</h3>

      {/* Admission Summary */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Admission Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-gray-600">Patient</p>
            <p className="font-medium text-gray-900">{patientName}</p>
          </div>
          <div>
            <p className="text-gray-600">Admission Date</p>
            <p className="font-medium text-gray-900">12/01/2024</p>
          </div>
          <div>
            <p className="text-gray-600">Admission ID</p>
            <p className="font-medium text-gray-900">{admissionId}</p>
          </div>
        </div>
      </Card>

      {/* Care Team */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Care Team
        </h4>
        <div className="space-y-2">
          {[
            { name: 'Dr. Sarah Mitchell', role: 'Physician' },
            { name: 'Emily Chen, RN', role: 'Case Manager' },
            { name: 'Michael Torres, PT', role: 'Physical Therapist' },
          ].map((member, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <UserCheck className="w-3.5 h-3.5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-600">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Orders */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          Recent Orders
        </h4>
        <div className="space-y-2">
          {[
            'Increase Lasix to 40mg PO daily',
            'Physical therapy 3x per week',
            'Monitor blood glucose QID',
          ].map((order, idx) => (
            <div key={idx} className="text-sm text-gray-700 flex items-start gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
              <p>{order}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Frequency Summary */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Frequency Summary
        </h4>
        <div className="space-y-2 text-sm">
          {[
            { discipline: 'SN', frequency: '2x/week' },
            { discipline: 'PT', frequency: '3x/week' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-gray-700">{item.discipline}</span>
              <span className="font-medium text-gray-900">{item.frequency}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Medication Summary */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Pill className="w-4 h-4" />
          Medication Summary
        </h4>
        <div className="space-y-2">
          {[
            { name: 'Lasix', dose: '40mg PO daily' },
            { name: 'Metformin', dose: '500mg PO BID' },
            { name: 'Lisinopril', dose: '10mg PO daily' },
          ].map((med, idx) => (
            <div key={idx} className="text-sm">
              <p className="font-medium text-gray-900">{med.name}</p>
              <p className="text-xs text-gray-600">{med.dose}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
