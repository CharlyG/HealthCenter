/**
 * Focus Mode Navigation
 * 
 * Reduces distractions during intensive workflows while preserving essential context.
 * Used for: Clinical documentation, Assessments, Orders, Plan of care editing
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Minimize2,
  Maximize2,
  Save,
  X,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface FocusModeProps {
  isEnabled: boolean;
  onToggle: () => void;
  patient?: {
    name: string;
    mrn: string;
    dob: string;
    alerts?: string[];
  };
  admission?: {
    startDate: string;
    primaryPayer: string;
  };
  documentTitle: string;
  documentStatus?: 'draft' | 'complete' | 'pending';
  validationErrors?: number;
  onSave?: () => void;
  onSaveAndExit?: () => void;
  onDiscard?: () => void;
  children: React.ReactNode;
}

export default function FocusMode({
  isEnabled,
  onToggle,
  patient,
  admission,
  documentTitle,
  documentStatus = 'draft',
  validationErrors = 0,
  onSave,
  onSaveAndExit,
  onDiscard,
  children,
}: FocusModeProps) {
  return (
    <div className={cn('h-screen flex flex-col', isEnabled ? 'bg-white' : 'bg-gray-100')}>
      {/* Compact Header (Essential Context Only) */}
      <FocusModeHeader
        isEnabled={isEnabled}
        onToggle={onToggle}
        patient={patient}
        admission={admission}
        documentTitle={documentTitle}
        documentStatus={documentStatus}
        validationErrors={validationErrors}
        onSave={onSave}
        onSaveAndExit={onSaveAndExit}
        onDiscard={onDiscard}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FOCUS MODE HEADER
// ═══════════════════════════════════════════════════════════════════════════

function FocusModeHeader({
  isEnabled,
  onToggle,
  patient,
  admission,
  documentTitle,
  documentStatus,
  validationErrors,
  onSave,
  onSaveAndExit,
  onDiscard,
}: {
  isEnabled: boolean;
  onToggle: () => void;
  patient?: { name: string; mrn: string; dob: string; alerts?: string[] };
  admission?: { startDate: string; primaryPayer: string };
  documentTitle: string;
  documentStatus: 'draft' | 'complete' | 'pending';
  validationErrors: number;
  onSave?: () => void;
  onSaveAndExit?: () => void;
  onDiscard?: () => void;
}) {
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    complete: { label: 'Complete', color: 'bg-green-100 text-green-700 border-green-300' },
    pending: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  };

  const status = statusConfig[documentStatus];

  return (
    <div
      className={cn(
        'border-b flex-shrink-0 transition-all',
        isEnabled ? 'h-14 bg-white' : 'h-16 bg-gray-50'
      )}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Patient + Document Context */}
        <div className="flex items-center gap-4">
          {/* Patient Info (Compact) */}
          {patient && (
            <div className="flex items-center gap-2 pr-4 border-r">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  {patient.name}
                  {patient.alerts && patient.alerts.length > 0 && (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  MRN: {patient.mrn} • DOB: {patient.dob}
                </div>
              </div>
            </div>
          )}

          {/* Admission Info (Compact) */}
          {admission && (
            <div className="flex items-center gap-2 pr-4 border-r">
              <Calendar className="w-4 h-4 text-gray-600" />
              <div className="text-xs text-gray-600">
                Adm: {admission.startDate} • {admission.primaryPayer}
              </div>
            </div>
          )}

          {/* Document Title + Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{documentTitle}</span>
            <Badge variant="outline" className={cn('text-xs', status.color)}>
              {status.label}
            </Badge>
            {validationErrors > 0 && (
              <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {validationErrors} {validationErrors === 1 ? 'error' : 'errors'}
              </Badge>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Save Actions */}
          {onSave && (
            <Button variant="outline" size="sm" onClick={onSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}

          {onSaveAndExit && (
            <Button variant="default" size="sm" onClick={onSaveAndExit}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save & Exit
            </Button>
          )}

          {/* Focus Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            title={isEnabled ? 'Exit Focus Mode' : 'Enter Focus Mode'}
          >
            {isEnabled ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>

          {/* Discard/Exit */}
          {onDiscard && (
            <Button variant="ghost" size="sm" onClick={onDiscard}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FOCUS MODE DEMO
// ═══════════════════════════════════════════════════════════════════════════

export function FocusModeDemo() {
  const [focusEnabled, setFocusEnabled] = useState(false);
  const [validationErrors] = useState(3);

  const patient = {
    name: 'Sarah Johnson',
    mrn: '123456',
    dob: '01/15/1965',
    alerts: ['Penicillin Allergy'],
  };

  const admission = {
    startDate: '03/01/2024',
    primaryPayer: 'Medicare',
  };

  return (
    <FocusMode
      isEnabled={focusEnabled}
      onToggle={() => setFocusEnabled(!focusEnabled)}
      patient={patient}
      admission={admission}
      documentTitle="Physical Therapy Visit Note"
      documentStatus="draft"
      validationErrors={validationErrors}
      onSave={() => console.log('Save')}
      onSaveAndExit={() => console.log('Save and Exit')}
      onDiscard={() => console.log('Discard')}
    >
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-blue-900 mb-2">Focus Mode Active</h2>
            <p className="text-sm text-blue-700">
              Sidebar and navigation chrome are hidden. Patient context and save actions remain
              accessible in the compact header.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Documentation Content</h3>
            <p className="text-gray-700">
              This area contains the clinical documentation form, assessment editor, or plan of
              care interface. The focus mode provides a distraction-free environment while keeping
              essential context visible.
            </p>

            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Clinical Documentation Editor Area</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div>
              <div className="font-medium text-amber-900">Validation Errors</div>
              <div className="text-sm text-amber-700">
                {validationErrors} fields require attention before submission
              </div>
            </div>
            <Button variant="outline" size="sm">
              View Errors
            </Button>
          </div>
        </div>
      </div>
    </FocusMode>
  );
}