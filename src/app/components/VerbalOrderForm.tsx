/**
 * Verbal Order Form Component
 * 
 * Form for documenting verbal orders received from physicians.
 * Captures essential information and clinical context for signature tracking.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Save,
  Send,
  X,
  Calendar,
  User,
  FileText,
  AlertCircle,
  Check,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface VerbalOrderFormData {
  orderDate: string;
  effectiveDate: string;
  orderingPhysician: {
    id: string;
    name: string;
    credentials?: string;
  };
  verbalOrderSummary: string;
  clinicalContext: string;
  enteredBy: {
    id: string;
    name: string;
    role: string;
  };
  relatedAdmission: {
    id: string;
    patientName: string;
  };
}

export interface VerbalOrder extends VerbalOrderFormData {
  id: string;
  status: 'draft' | 'completed' | 'pending-physician-signature' | 'signed' | 'returned-for-correction';
  createdAt: string;
  updatedAt: string;
  sentForSignatureAt?: string;
  signedAt?: string;
  returnedAt?: string;
  returnReason?: string;
  daysPending?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface VerbalOrderFormProps {
  initialData?: Partial<VerbalOrderFormData>;
  mode?: 'create' | 'edit';
  onSave?: (data: VerbalOrderFormData, saveAndSend: boolean) => void;
  onCancel?: () => void;
}

export default function VerbalOrderForm({
  initialData,
  mode = 'create',
  onSave,
  onCancel,
}: VerbalOrderFormProps) {
  const [formData, setFormData] = useState<Partial<VerbalOrderFormData>>({
    orderDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    verbalOrderSummary: '',
    clinicalContext: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderDate) {
      newErrors.orderDate = 'Order date is required';
    }
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    }
    if (!formData.orderingPhysician?.name) {
      newErrors.orderingPhysician = 'Ordering physician is required';
    }
    if (!formData.verbalOrderSummary || formData.verbalOrderSummary.trim().length < 10) {
      newErrors.verbalOrderSummary = 'Order summary must be at least 10 characters';
    }
    if (!formData.clinicalContext || formData.clinicalContext.trim().length < 10) {
      newErrors.clinicalContext = 'Clinical context must be at least 10 characters';
    }
    if (!formData.relatedAdmission?.id) {
      newErrors.relatedAdmission = 'Related admission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (sendForSignature: boolean = false) => {
    if (!validateForm()) return;

    setIsSaving(true);
    setTimeout(() => {
      onSave?.(formData as VerbalOrderFormData, sendForSignature);
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'New Verbal Order' : 'Edit Verbal Order'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Document verbal order received from physician
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          Requires Physician Signature
        </Badge>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Date Section */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Order Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date *
              </label>
              <Input
                type="date"
                value={formData.orderDate || ''}
                onChange={e =>
                  setFormData({ ...formData, orderDate: e.target.value })
                }
                className={cn(errors.orderDate && 'border-red-500')}
              />
              {errors.orderDate && (
                <p className="text-xs text-red-600 mt-1">{errors.orderDate}</p>
              )}
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effective Date *
              </label>
              <Input
                type="date"
                value={formData.effectiveDate || ''}
                onChange={e =>
                  setFormData({ ...formData, effectiveDate: e.target.value })
                }
                className={cn(errors.effectiveDate && 'border-red-500')}
              />
              {errors.effectiveDate && (
                <p className="text-xs text-red-600 mt-1">{errors.effectiveDate}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Physician & Admission Section */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Physician & Admission Information
          </h4>
          <div className="space-y-4">
            {/* Ordering Physician */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordering Physician *
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search physician by name..."
                  value={formData.orderingPhysician?.name || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      orderingPhysician: {
                        id: 'PHY-001',
                        name: e.target.value,
                      },
                    })
                  }
                  className={cn(errors.orderingPhysician && 'border-red-500')}
                />
                <Button variant="outline" size="sm">
                  Search
                </Button>
              </div>
              {errors.orderingPhysician && (
                <p className="text-xs text-red-600 mt-1">{errors.orderingPhysician}</p>
              )}
              {formData.orderingPhysician?.name && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    {formData.orderingPhysician.name}
                    {formData.orderingPhysician.credentials &&
                      `, ${formData.orderingPhysician.credentials}`}
                  </p>
                </div>
              )}
            </div>

            {/* Related Admission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Admission *
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search admission..."
                  value={formData.relatedAdmission?.patientName || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      relatedAdmission: {
                        id: 'ADM-001',
                        patientName: e.target.value,
                      },
                    })
                  }
                  className={cn(errors.relatedAdmission && 'border-red-500')}
                />
                <Button variant="outline" size="sm">
                  Search
                </Button>
              </div>
              {errors.relatedAdmission && (
                <p className="text-xs text-red-600 mt-1">{errors.relatedAdmission}</p>
              )}
              {formData.relatedAdmission?.id && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    {formData.relatedAdmission.patientName} • Admission #{formData.relatedAdmission.id}
                  </p>
                </div>
              )}
            </div>

            {/* Entered By (Auto-filled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entered By
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {formData.enteredBy?.name || 'Emily Chen'},{' '}
                  {formData.enteredBy?.role || 'RN'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Current user • Auto-filled
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Details Section */}
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Order Details
          </h4>
          <div className="space-y-4">
            {/* Verbal Order Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verbal Order Summary *
              </label>
              <textarea
                placeholder="Enter the verbal order as received from physician (e.g., 'Increase Lasix to 40mg PO daily for CHF management')..."
                value={formData.verbalOrderSummary || ''}
                onChange={e =>
                  setFormData({ ...formData, verbalOrderSummary: e.target.value })
                }
                rows={3}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none',
                  errors.verbalOrderSummary ? 'border-red-500' : 'border-gray-300'
                )}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.verbalOrderSummary ? (
                  <p className="text-xs text-red-600">{errors.verbalOrderSummary}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {formData.verbalOrderSummary?.length || 0} characters (min 10)
                  </p>
                )}
              </div>
            </div>

            {/* Clinical Context */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinical Context *
              </label>
              <textarea
                placeholder="Provide clinical context and rationale (e.g., 'Patient showing signs of fluid overload with 3+ pitting edema, crackles on lung auscultation')..."
                value={formData.clinicalContext || ''}
                onChange={e =>
                  setFormData({ ...formData, clinicalContext: e.target.value })
                }
                rows={4}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none',
                  errors.clinicalContext ? 'border-red-500' : 'border-gray-300'
                )}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.clinicalContext ? (
                  <p className="text-xs text-red-600">{errors.clinicalContext}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {formData.clinicalContext?.length || 0} characters (min 10)
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Important Notice */}
        <Card className="p-4 bg-amber-50 border-amber-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900 text-sm">
                Physician Signature Required
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Per regulatory requirements, all verbal orders must be signed by the
                ordering physician within the required timeframe. You can save this order
                as a draft or complete and send for signature immediately.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            <Send className="w-4 h-4 mr-2" />
            Complete & Send for Signature
          </Button>
        </div>
      </div>
    </div>
  );
}
