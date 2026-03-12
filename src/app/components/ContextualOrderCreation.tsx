/**
 * Contextual Order Creation Component
 * 
 * Allows staff to create physician orders directly from relevant clinical contexts
 * (visit documentation, wound care, medication review, care plan updates).
 * Intelligently prefills patient, admission, and clinical information to reduce
 * duplicate data entry and make order creation feel integrated with clinical work.
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  X,
  Save,
  FileText,
  Stethoscope,
  AlertCircle,
  Clock,
  User,
  Calendar,
  CheckCircle,
  ChevronRight,
  Pill,
  Activity,
  Target,
  FilePlus,
  Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ClinicalContext = 'visit' | 'wound' | 'medication' | 'care-plan';

export type OrderType = 
  | 'wound-care'
  | 'medication'
  | 'dme'
  | 'therapy'
  | 'lab'
  | 'imaging'
  | 'skilled-nursing'
  | 'other';

export interface PrefilledData {
  patientId?: string;
  patientName?: string;
  admissionId?: string;
  visitId?: string;
  visitDate?: string;
  clinician?: string;
  clinicalContext?: {
    type: ClinicalContext;
    sourceLabel: string;
    relatedData?: Record<string, any>;
  };
}

export interface OrderFormData {
  orderType: OrderType;
  description: string;
  frequency?: string;
  duration?: string;
  startDate: string;
  endDate?: string;
  urgency: 'routine' | 'urgent' | 'stat';
  clinicalRationale: string;
  additionalInstructions?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONTEXT_CONFIG: Record<ClinicalContext, {
  label: string;
  icon: any;
  color: string;
  suggestedOrderTypes: OrderType[];
}> = {
  visit: {
    label: 'Visit Documentation',
    icon: FileText,
    color: '#3B82F6',
    suggestedOrderTypes: ['skilled-nursing', 'therapy', 'medication', 'lab'],
  },
  wound: {
    label: 'Wound Documentation',
    icon: Activity,
    color: '#EF4444',
    suggestedOrderTypes: ['wound-care', 'medication', 'dme', 'lab'],
  },
  medication: {
    label: 'Medication Review',
    icon: Pill,
    color: '#8B5CF6',
    suggestedOrderTypes: ['medication', 'lab'],
  },
  'care-plan': {
    label: 'Care Plan Updates',
    icon: Target,
    color: '#10B981',
    suggestedOrderTypes: ['therapy', 'skilled-nursing', 'medication', 'dme'],
  },
};

const ORDER_TYPE_CONFIG: Record<OrderType, { label: string; icon: any }> = {
  'wound-care': { label: 'Wound Care', icon: Activity },
  'medication': { label: 'Medication', icon: Pill },
  'dme': { label: 'DME/Supplies', icon: FileText },
  'therapy': { label: 'Therapy Services', icon: Stethoscope },
  'lab': { label: 'Laboratory', icon: FileText },
  'imaging': { label: 'Imaging', icon: FileText },
  'skilled-nursing': { label: 'Skilled Nursing', icon: User },
  'other': { label: 'Other', icon: FileText },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ContextualOrderCreationProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledData: PrefilledData;
  onSave?: (orderData: OrderFormData) => void;
}

export default function ContextualOrderCreation({
  isOpen,
  onClose,
  prefilledData,
  onSave,
}: ContextualOrderCreationProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    orderType: 'medication',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    urgency: 'routine',
    clinicalRationale: '',
  });

  const [showPrefilledInfo, setShowPrefilledInfo] = useState(true);

  // Prefill clinical rationale based on context
  useEffect(() => {
    if (!prefilledData.clinicalContext) return;

    const context = prefilledData.clinicalContext;
    let prefillText = '';

    switch (context.type) {
      case 'wound':
        if (context.relatedData?.location) {
          prefillText = `Wound care required for ${context.relatedData.location} wound. `;
        }
        if (context.relatedData?.size) {
          prefillText += `Current size: ${context.relatedData.size}. `;
        }
        if (context.relatedData?.signs) {
          prefillText += `Signs of ${context.relatedData.signs}. `;
        }
        break;
      case 'medication':
        if (context.relatedData?.medicationName) {
          prefillText = `Medication order related to ${context.relatedData.medicationName}. `;
        }
        if (context.relatedData?.concern) {
          prefillText += `${context.relatedData.concern}. `;
        }
        break;
      case 'care-plan':
        if (context.relatedData?.goalDescription) {
          prefillText = `Order to support care plan goal: ${context.relatedData.goalDescription}. `;
        }
        break;
      case 'visit':
        if (context.relatedData?.findings) {
          prefillText = `Based on visit findings: ${context.relatedData.findings}. `;
        }
        break;
    }

    if (prefillText) {
      setFormData(prev => ({
        ...prev,
        clinicalRationale: prefillText + prev.clinicalRationale,
      }));
    }
  }, [prefilledData.clinicalContext]);

  const contextConfig = prefilledData.clinicalContext
    ? CONTEXT_CONFIG[prefilledData.clinicalContext.type]
    : null;

  const handleSave = () => {
    onSave?.(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FilePlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Create Order</h2>
              {contextConfig && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      backgroundColor: `${contextConfig.color}10`,
                      borderColor: `${contextConfig.color}40`,
                      color: contextConfig.color,
                    }}
                  >
                    <contextConfig.icon className="w-3 h-3 mr-1" />
                    From {contextConfig.label}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Prefilled Information Banner */}
          {showPrefilledInfo && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900 text-sm">
                      Information Auto-Filled
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPrefilledInfo(false)}
                      className="h-6 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">
                    We've automatically filled in information from the current clinical context
                    to save you time. You can edit any prefilled fields.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {prefilledData.patientName && (
                      <PrefilledField
                        label="Patient"
                        value={prefilledData.patientName}
                        icon={User}
                      />
                    )}
                    {prefilledData.admissionId && (
                      <PrefilledField
                        label="Admission"
                        value={prefilledData.admissionId}
                        icon={FileText}
                      />
                    )}
                    {prefilledData.visitDate && (
                      <PrefilledField
                        label="Visit Date"
                        value={new Date(prefilledData.visitDate).toLocaleDateString()}
                        icon={Calendar}
                      />
                    )}
                    {prefilledData.clinician && (
                      <PrefilledField
                        label="Clinician"
                        value={prefilledData.clinician}
                        icon={User}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Patient & Admission Context */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Patient</p>
              <p className="font-semibold text-gray-900">{prefilledData.patientName}</p>
              <p className="text-xs text-gray-600">{prefilledData.patientId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Admission</p>
              <p className="font-semibold text-gray-900">{prefilledData.admissionId}</p>
            </div>
          </div>

          {/* Order Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Type <span className="text-red-600">*</span>
            </label>
            {contextConfig && (
              <p className="text-xs text-gray-600 mb-3">
                Suggested for {contextConfig.label}:
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {(contextConfig?.suggestedOrderTypes || Object.keys(ORDER_TYPE_CONFIG)).map(
                (type) => {
                  const config = ORDER_TYPE_CONFIG[type as OrderType];
                  const isSelected = formData.orderType === type;
                  const isSuggested = contextConfig?.suggestedOrderTypes.includes(
                    type as OrderType
                  );

                  return (
                    <button
                      key={type}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, orderType: type as OrderType }))
                      }
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all flex items-center gap-3',
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          isSelected ? 'bg-blue-100' : 'bg-gray-100'
                        )}
                      >
                        <config.icon
                          className={cn('w-4 h-4', isSelected ? 'text-blue-600' : 'text-gray-600')}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            'font-semibold text-sm',
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          )}
                        >
                          {config.label}
                        </p>
                        {isSuggested && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Suggested
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Order Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Description <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe the order in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
          </div>

          {/* Frequency & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select
                value={formData.frequency || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, frequency: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select frequency...</option>
                <option value="once">Once</option>
                <option value="daily">Daily</option>
                <option value="bid">BID (twice daily)</option>
                <option value="tid">TID (three times daily)</option>
                <option value="qid">QID (four times daily)</option>
                <option value="weekly">Weekly</option>
                <option value="prn">PRN (as needed)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <input
                type="text"
                value={formData.duration || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, duration: e.target.value }))
                }
                placeholder="e.g., 30 days, ongoing"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Start & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['routine', 'urgent', 'stat'] as const).map((urgency) => {
                const isSelected = formData.urgency === urgency;
                return (
                  <button
                    key={urgency}
                    onClick={() => setFormData((prev) => ({ ...prev, urgency }))}
                    className={cn(
                      'p-3 rounded-lg border-2 text-center transition-all',
                      isSelected
                        ? urgency === 'stat'
                          ? 'border-red-500 bg-red-50'
                          : urgency === 'urgent'
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p
                      className={cn(
                        'font-semibold text-sm capitalize',
                        isSelected
                          ? urgency === 'stat'
                            ? 'text-red-900'
                            : urgency === 'urgent'
                            ? 'text-amber-900'
                            : 'text-blue-900'
                          : 'text-gray-900'
                      )}
                    >
                      {urgency}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Rationale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinical Rationale <span className="text-red-600">*</span>
            </label>
            {prefilledData.clinicalContext?.relatedData && (
              <p className="text-xs text-gray-600 mb-2">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Pre-filled from {prefilledData.clinicalContext.sourceLabel}
              </p>
            )}
            <textarea
              value={formData.clinicalRationale}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, clinicalRationale: e.target.value }))
              }
              placeholder="Explain the clinical reason for this order..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Instructions
            </label>
            <textarea
              value={formData.additionalInstructions || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, additionalInstructions: e.target.value }))
              }
              placeholder="Any additional instructions or notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PREFILLED FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PrefilledFieldProps {
  label: string;
  value: string;
  icon: any;
}

function PrefilledField({ label, value, icon: Icon }: PrefilledFieldProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="w-3 h-3 text-blue-600" />
      <div>
        <p className="text-blue-700 font-medium">{label}:</p>
        <p className="text-blue-900 font-semibold">{value}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════

// Example: Quick Order Button for Visit Documentation
export function QuickOrderFromVisit({
  visitData,
}: {
  visitData: {
    patientName: string;
    patientId: string;
    admissionId: string;
    visitId: string;
    visitDate: string;
    clinician: string;
    findings?: string;
  };
}) {
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const prefilledData: PrefilledData = {
    patientName: visitData.patientName,
    patientId: visitData.patientId,
    admissionId: visitData.admissionId,
    visitId: visitData.visitId,
    visitDate: visitData.visitDate,
    clinician: visitData.clinician,
    clinicalContext: {
      type: 'visit',
      sourceLabel: 'Visit Documentation',
      relatedData: {
        findings: visitData.findings,
      },
    },
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowOrderDialog(true)}
        className="border-blue-200 text-blue-700 hover:bg-blue-50"
      >
        <FilePlus className="w-4 h-4 mr-2" />
        Create Order from Visit
      </Button>

      <ContextualOrderCreation
        isOpen={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        prefilledData={prefilledData}
        onSave={(orderData) => {
          console.log('Order created from visit:', orderData);
        }}
      />
    </>
  );
}

// Example: Quick Order Button for Wound Documentation
export function QuickOrderFromWound({
  woundData,
}: {
  woundData: {
    patientName: string;
    patientId: string;
    admissionId: string;
    visitDate: string;
    clinician: string;
    woundLocation: string;
    woundSize: string;
    signs?: string;
  };
}) {
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const prefilledData: PrefilledData = {
    patientName: woundData.patientName,
    patientId: woundData.patientId,
    admissionId: woundData.admissionId,
    visitDate: woundData.visitDate,
    clinician: woundData.clinician,
    clinicalContext: {
      type: 'wound',
      sourceLabel: 'Wound Documentation',
      relatedData: {
        location: woundData.woundLocation,
        size: woundData.woundSize,
        signs: woundData.signs,
      },
    },
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowOrderDialog(true)}
        className="border-red-200 text-red-700 hover:bg-red-50"
      >
        <FilePlus className="w-4 h-4 mr-2" />
        Order Wound Care
      </Button>

      <ContextualOrderCreation
        isOpen={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        prefilledData={prefilledData}
        onSave={(orderData) => {
          console.log('Order created from wound:', orderData);
        }}
      />
    </>
  );
}

// Example: Quick Order Button for Medication Review
export function QuickOrderFromMedication({
  medicationData,
}: {
  medicationData: {
    patientName: string;
    patientId: string;
    admissionId: string;
    visitDate: string;
    clinician: string;
    medicationName: string;
    concern?: string;
  };
}) {
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const prefilledData: PrefilledData = {
    patientName: medicationData.patientName,
    patientId: medicationData.patientId,
    admissionId: medicationData.admissionId,
    visitDate: medicationData.visitDate,
    clinician: medicationData.clinician,
    clinicalContext: {
      type: 'medication',
      sourceLabel: 'Medication Review',
      relatedData: {
        medicationName: medicationData.medicationName,
        concern: medicationData.concern,
      },
    },
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowOrderDialog(true)}
        className="border-purple-200 text-purple-700 hover:bg-purple-50"
      >
        <FilePlus className="w-4 h-4 mr-2" />
        Order Medication Change
      </Button>

      <ContextualOrderCreation
        isOpen={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        prefilledData={prefilledData}
        onSave={(orderData) => {
          console.log('Order created from medication:', orderData);
        }}
      />
    </>
  );
}

// Example: Quick Order Button for Care Plan
export function QuickOrderFromCarePlan({
  carePlanData,
}: {
  carePlanData: {
    patientName: string;
    patientId: string;
    admissionId: string;
    clinician: string;
    goalDescription: string;
  };
}) {
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  const prefilledData: PrefilledData = {
    patientName: carePlanData.patientName,
    patientId: carePlanData.patientId,
    admissionId: carePlanData.admissionId,
    clinician: carePlanData.clinician,
    clinicalContext: {
      type: 'care-plan',
      sourceLabel: 'Care Plan Updates',
      relatedData: {
        goalDescription: carePlanData.goalDescription,
      },
    },
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowOrderDialog(true)}
        className="border-green-200 text-green-700 hover:bg-green-50"
      >
        <FilePlus className="w-4 h-4 mr-2" />
        Order from Care Plan
      </Button>

      <ContextualOrderCreation
        isOpen={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        prefilledData={prefilledData}
        onSave={(orderData) => {
          console.log('Order created from care plan:', orderData);
        }}
      />
    </>
  );
}
