/**
 * OASIS EDITOR LAYOUT
 * 
 * Production-grade large-form editor layout for OASIS assessments
 * Optimized for long forms with sticky navigation and action bars
 */

import { useState, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { OasisSectionNav } from './OasisSectionNav';
import { OasisValidationPanel } from './OasisValidationPanel';
import { AssessmentAutosaveIndicator } from '../assessment/AssessmentAutosaveIndicator';
import {
  Save,
  Send,
  FileCheck,
  CheckSquare,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { OasisAssessment, OasisSection } from '../../types/oasis';
import { OASIS_TIMEPOINT_CONFIG } from '../../types/oasis';

interface OasisEditorLayoutProps {
  assessment: OasisAssessment;
  sections: OasisSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  children: ReactNode;
  onSave?: () => void;
  onValidate?: () => void;
  onSubmitSignature?: () => void;
  onSubmitQA?: () => void;
  onPrint?: () => void;
  onClose?: () => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
}

export function OasisEditorLayout({
  assessment,
  sections,
  activeSection,
  onSectionChange,
  children,
  onSave,
  onValidate,
  onSubmitSignature,
  onSubmitQA,
  onPrint,
  onClose,
  saveStatus = 'saved',
}: OasisEditorLayoutProps) {
  const [showValidation, setShowValidation] = useState(true);
  const [reviewErrorsMode, setReviewErrorsMode] = useState(false);
  
  const timepointConfig = OASIS_TIMEPOINT_CONFIG[assessment.timepoint];
  const currentSectionIndex = sections.findIndex((s) => s.id === activeSection);
  const canGoPrevious = currentSectionIndex > 0;
  const canGoNext = currentSectionIndex < sections.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onSectionChange(sections[currentSectionIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onSectionChange(sections[currentSectionIndex + 1].id);
    }
  };

  const totalErrors = sections.reduce((sum, s) => sum + s.validationErrors, 0);
  const totalWarnings = sections.reduce((sum, s) => sum + s.validationWarnings, 0);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        {/* Top Bar */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900">OASIS-{assessment.oasisVersion}</h1>
                  <Badge className={`bg-${timepointConfig.color}-100 text-${timepointConfig.color}-700`}>
                    {timepointConfig.shortLabel}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {assessment.id}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{assessment.patientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AssessmentAutosaveIndicator
                status={saveStatus}
                lastSaveTime={assessment.lastAutoSave}
              />

              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>

              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>

              <Button
                size="sm"
                onClick={onValidate}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Validate
              </Button>

              {assessment.isValid && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={onSubmitSignature}
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Submit for Signature
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Patient Info Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Patient:</span>
                <span>{assessment.patientName}</span>
                <Badge variant="outline" className="text-xs">
                  {assessment.patientId}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Assessment Date:</span>
                <span>{new Date(assessment.assessmentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Timepoint:</span>
                <span>{timepointConfig.label}</span>
              </div>
            </div>

            {/* Error Summary */}
            {(totalErrors > 0 || totalWarnings > 0) && (
              <div className="flex items-center gap-2">
                {totalErrors > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    {totalErrors} Error{totalErrors !== 1 ? 's' : ''}
                  </Badge>
                )}
                {totalWarnings > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    {totalWarnings} Warning{totalWarnings !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReviewErrorsMode(!reviewErrorsMode)}
                  className="h-7"
                >
                  {reviewErrorsMode ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Show All
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 mr-1" />
                      Errors Only
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section Navigation */}
        <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <OasisSectionNav
              sections={sections}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
              mode={reviewErrorsMode ? 'review-errors' : 'normal'}
            />
          </div>
        </div>

        {/* Center - Form Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {sections.find((s) => s.id === activeSection)?.title}
                  </h2>
                  {sections.find((s) => s.id === activeSection)?.subtitle && (
                    <p className="text-gray-600 mt-1">
                      {sections.find((s) => s.id === activeSection)?.subtitle}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {sections.find((s) => s.id === activeSection)?.mItemRange}
                </Badge>
              </div>

              {/* Section Status Bar */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">
                  {sections.find((s) => s.id === activeSection)?.completedItems} of{' '}
                  {sections.find((s) => s.id === activeSection)?.itemCount} items completed
                </span>
                {sections.find((s) => s.id === activeSection)?.validationErrors! > 0 && (
                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                    {sections.find((s) => s.id === activeSection)?.validationErrors} error
                    {sections.find((s) => s.id === activeSection)?.validationErrors !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>

            {/* Form Content */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {children}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 sticky bottom-0 bg-white border-t border-gray-200 pt-4 -mx-6 px-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={!canGoPrevious}
                size="lg"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Section
              </Button>
              <div className="text-sm text-gray-600">
                Section {currentSectionIndex + 1} of {sections.length}
              </div>
              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next Section
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Validation Panel */}
        {showValidation && (
          <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Validation</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowValidation(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <OasisValidationPanel
                issues={assessment.validationIssues}
                sections={sections}
                percentComplete={assessment.percentComplete}
                onNavigateToSection={onSectionChange}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Toolbar - Sticky */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Overall Progress:</span>
              <span className="font-medium text-gray-900">{assessment.percentComplete}%</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${assessment.percentComplete}%` }}
                />
              </div>
            </div>
            {totalErrors > 0 && (
              <>
                <span>•</span>
                <span className="text-red-600 font-medium">
                  {totalErrors} validation error{totalErrors !== 1 ? 's' : ''}
                </span>
              </>
            )}
            {totalWarnings > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-600 font-medium">
                  {totalWarnings} warning{totalWarnings !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!showValidation && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValidation(true)}
              >
                Show Validation
              </Button>
            )}

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>

            {assessment.isValid && assessment.percentComplete === 100 && (
              <Button
                onClick={onSubmitSignature}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit for Signature
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
