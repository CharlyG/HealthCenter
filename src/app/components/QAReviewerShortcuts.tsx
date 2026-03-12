/**
 * QA Reviewer Shortcuts Component
 * 
 * Productivity shortcuts for QA reviewers including approve+next, return with
 * template, jump to validation error, and view admission summary. Allows
 * reviewers to process documents quickly.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  AlertTriangle,
  FileText,
  MessageSquare,
  Zap,
  Command,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ReturnTemplate {
  id: string;
  name: string;
  category: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface ValidationError {
  id: string;
  fieldName: string;
  sectionName: string;
  errorMessage: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface AdmissionSummary {
  admissionId: string;
  patientName: string;
  admissionDate: string;
  primaryDiagnosis: string;
  disciplines: string[];
  currentEpisode: number;
  totalVisits: number;
}

export interface QAReviewerShortcutsData {
  currentDocumentId: string;
  nextDocumentId?: string;
  validationErrors: ValidationError[];
  returnTemplates: ReturnTemplate[];
  admissionSummary: AdmissionSummary;
  hasNextDocument: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const TEMPLATE_CATEGORIES = [
  'Missing Information',
  'Incorrect Data',
  'Compliance',
  'Documentation Quality',
  'Billing',
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QAReviewerShortcutsProps {
  data: QAReviewerShortcutsData;
  onApproveAndNext: () => void;
  onReturnWithTemplate: (templateId: string) => void;
  onJumpToError: (errorId: string) => void;
  onViewAdmissionSummary: () => void;
  mode?: 'full' | 'sidebar';
}

export default function QAReviewerShortcuts({
  data,
  onApproveAndNext,
  onReturnWithTemplate,
  onJumpToError,
  onViewAdmissionSummary,
  mode = 'full',
}: QAReviewerShortcutsProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const criticalErrors = data.validationErrors.filter((e) => e.severity === 'critical');
  const filteredTemplates = selectedCategory
    ? data.returnTemplates.filter((t) => t.category === selectedCategory)
    : data.returnTemplates;

  if (mode === 'sidebar') {
    return (
      <SidebarShortcuts
        data={data}
        onApproveAndNext={onApproveAndNext}
        onJumpToError={onJumpToError}
        onViewAdmissionSummary={onViewAdmissionSummary}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions Header */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Quick Actions</h3>
          <Badge variant="outline" className="bg-white text-blue-700 border-blue-300 text-xs ml-auto">
            Keyboard Shortcuts Enabled
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Approve & Next */}
          <Button
            onClick={onApproveAndNext}
            disabled={!data.hasNextDocument}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve & Next
            <kbd className="ml-auto px-2 py-0.5 text-xs bg-white/20 rounded">Ctrl+A</kbd>
          </Button>

          {/* Return for Correction */}
          <Button
            onClick={() => setShowTemplates(!showTemplates)}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Return with Template
            <kbd className="ml-auto px-2 py-0.5 text-xs bg-gray-100 rounded">Ctrl+R</kbd>
          </Button>
        </div>
      </Card>

      {/* Template Selection */}
      {showTemplates && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Select Return Template</h4>
            <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
              Cancel
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={cn(!selectedCategory && 'bg-blue-100 border-blue-300')}
            >
              All Templates
            </Button>
            {TEMPLATE_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(selectedCategory === category && 'bg-blue-100 border-blue-300')}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Template List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onReturnWithTemplate(template.id);
                  setShowTemplates(false);
                }}
                className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{template.name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      template.severity === 'critical'
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : template.severity === 'major'
                        ? 'bg-orange-100 text-orange-700 border-orange-300'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    )}
                  >
                    {template.severity}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                    {template.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{template.message}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Validation Errors */}
      {data.validationErrors.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-gray-900">Validation Errors</h4>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
              {data.validationErrors.length} error{data.validationErrors.length !== 1 ? 's' : ''}
            </Badge>
            {criticalErrors.length > 0 && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                {criticalErrors.length} critical
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {data.validationErrors.slice(0, 5).map((error, index) => (
              <button
                key={error.id}
                onClick={() => onJumpToError(error.id)}
                className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
                      error.severity === 'critical'
                        ? 'bg-red-600'
                        : error.severity === 'major'
                        ? 'bg-orange-600'
                        : 'bg-yellow-600'
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{error.fieldName}</span>
                      <span className="text-xs text-gray-600">• {error.sectionName}</span>
                    </div>
                    <p className="text-sm text-gray-600">{error.errorMessage}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </button>
            ))}

            {data.validationErrors.length > 5 && (
              <div className="text-xs text-gray-600 text-center pt-2">
                +{data.validationErrors.length - 5} more error{data.validationErrors.length - 5 !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onJumpToError(data.validationErrors[0].id)}
            className="w-full mt-3"
          >
            Jump to First Error
            <kbd className="ml-auto px-2 py-0.5 text-xs bg-gray-100 rounded">Ctrl+E</kbd>
          </Button>
        </Card>
      )}

      {/* Admission Summary */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Admission Context</h4>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewAdmissionSummary}>
            View Full Summary
            <kbd className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded">Ctrl+I</kbd>
          </Button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Patient:</span>
            <span className="font-medium text-gray-900">{data.admissionSummary.patientName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Admission:</span>
            <span className="font-medium text-gray-900">{data.admissionSummary.admissionId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Admit Date:</span>
            <span className="font-medium text-gray-900">
              {new Date(data.admissionSummary.admissionDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Primary Dx:</span>
            <span className="font-medium text-gray-900">{data.admissionSummary.primaryDiagnosis}</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-gray-600">Disciplines:</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {data.admissionSummary.disciplines.map((d) => (
                <Badge key={d} variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                  {d}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Episode:</span>
            <span className="font-medium text-gray-900">
              Day {data.admissionSummary.currentEpisode} • {data.admissionSummary.totalVisits} visits
            </span>
          </div>
        </div>
      </Card>

      {/* Keyboard Shortcuts Reference */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Command className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900 text-sm">Keyboard Shortcuts</h4>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Approve & Next</span>
            <kbd className="px-2 py-1 bg-white rounded border">Ctrl+A</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Return Template</span>
            <kbd className="px-2 py-1 bg-white rounded border">Ctrl+R</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Jump to Error</span>
            <kbd className="px-2 py-1 bg-white rounded border">Ctrl+E</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">View Summary</span>
            <kbd className="px-2 py-1 bg-white rounded border">Ctrl+I</kbd>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR SHORTCUTS
// ═══════════════════════════════════════════════════════════════════════════

function SidebarShortcuts({
  data,
  onApproveAndNext,
  onJumpToError,
  onViewAdmissionSummary,
}: {
  data: QAReviewerShortcutsData;
  onApproveAndNext: () => void;
  onJumpToError: (errorId: string) => void;
  onViewAdmissionSummary: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Quick Actions */}
      <Card className="p-3">
        <h4 className="font-semibold text-sm text-gray-900 mb-2">Quick Actions</h4>
        <div className="space-y-2">
          <Button
            onClick={onApproveAndNext}
            disabled={!data.hasNextDocument}
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-3 h-3 mr-2" />
            Approve & Next
          </Button>
          {data.validationErrors.length > 0 && (
            <Button
              onClick={() => onJumpToError(data.validationErrors[0].id)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <AlertTriangle className="w-3 h-3 mr-2" />
              Jump to Error ({data.validationErrors.length})
            </Button>
          )}
        </div>
      </Card>

      {/* Admission Info */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm text-gray-900">Admission</h4>
          <Button variant="ghost" size="sm" onClick={onViewAdmissionSummary} className="h-6 px-2">
            <FileText className="w-3 h-3" />
          </Button>
        </div>
        <div className="space-y-1 text-xs">
          <div className="text-gray-900 font-medium">{data.admissionSummary.patientName}</div>
          <div className="text-gray-600">{data.admissionSummary.admissionId}</div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockReturnTemplates(): ReturnTemplate[] {
  return [
    {
      id: 'tmpl-1',
      name: 'Missing Vital Signs',
      category: 'Missing Information',
      message:
        'Required vital signs are not documented. Please record all vital signs including blood pressure, heart rate, temperature, respiratory rate, and oxygen saturation.',
      severity: 'critical',
    },
    {
      id: 'tmpl-2',
      name: 'Incomplete Assessment',
      category: 'Documentation Quality',
      message:
        'Clinical assessment lacks sufficient detail. Please expand the assessment to include specific observations, patient responses to interventions, and clinical judgment.',
      severity: 'major',
    },
    {
      id: 'tmpl-3',
      name: 'Outdated Medication List',
      category: 'Incorrect Data',
      message:
        'Medication list appears outdated and does not match recent hospital discharge or physician orders. Please verify all current medications with the patient and update accordingly.',
      severity: 'major',
    },
    {
      id: 'tmpl-4',
      name: 'Missing Signature',
      category: 'Compliance',
      message:
        'Document is missing required clinician signature. Please sign and date the document before resubmission.',
      severity: 'critical',
    },
    {
      id: 'tmpl-5',
      name: 'Homebound Status Not Documented',
      category: 'Billing',
      message:
        'Clear documentation of homebound status is required for billing compliance. Please document why the patient is homebound and the taxing effort required to leave home.',
      severity: 'critical',
    },
  ];
}

export function generateMockValidationErrors(): ValidationError[] {
  return [
    {
      id: 'err-1',
      fieldName: 'Blood Pressure',
      sectionName: 'Vital Signs',
      errorMessage: 'Blood pressure is a required field and cannot be left blank',
      severity: 'critical',
    },
    {
      id: 'err-2',
      fieldName: 'Wound Measurements',
      sectionName: 'Wound Assessment',
      errorMessage: 'Length and width measurements are required when documenting wound care',
      severity: 'major',
    },
    {
      id: 'err-3',
      fieldName: 'Patient Education',
      sectionName: 'Patient/Caregiver Teaching',
      errorMessage: 'Patient education topics and response must be documented',
      severity: 'minor',
    },
  ];
}

export function generateMockShortcutsData(): QAReviewerShortcutsData {
  return {
    currentDocumentId: 'VN-2024-445',
    nextDocumentId: 'VN-2024-446',
    validationErrors: generateMockValidationErrors(),
    returnTemplates: generateMockReturnTemplates(),
    admissionSummary: {
      admissionId: 'ADM-12345',
      patientName: 'Margaret Johnson',
      admissionDate: '2024-11-15',
      primaryDiagnosis: 'CHF Exacerbation',
      disciplines: ['SN', 'PT', 'OT'],
      currentEpisode: 23,
      totalVisits: 8,
    },
    hasNextDocument: true,
  };
}
