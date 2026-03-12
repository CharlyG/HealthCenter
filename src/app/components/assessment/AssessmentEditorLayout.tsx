/**
 * ASSESSMENT EDITOR LAYOUT
 * 
 * Main editor layout with:
 * - Sticky patient/admission header
 * - Left section navigation
 * - Center form area
 * - Right validation panel
 * - Bottom action toolbar
 */

import { useState, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AssessmentSectionNav } from './AssessmentSectionNav';
import { AssessmentValidationPanel } from './AssessmentValidationPanel';
import { AssessmentAutosaveIndicator } from './AssessmentAutosaveIndicator';
import {
  Save,
  Send,
  FileCheck,
  History,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Building,
} from 'lucide-react';
import type { Assessment, AssessmentSection, ValidationIssue } from '../../types/assessment';
import { ASSESSMENT_TYPES } from '../../types/assessment';

interface AssessmentEditorLayoutProps {
  assessment: Assessment;
  sections: AssessmentSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  children: ReactNode;
  onSave?: () => void;
  onSubmitSignature?: () => void;
  onSubmitQA?: () => void;
  onViewHistory?: () => void;
  onClose?: () => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved' | 'error';
}

export function AssessmentEditorLayout({
  assessment,
  sections,
  activeSection,
  onSectionChange,
  children,
  onSave,
  onSubmitSignature,
  onSubmitQA,
  onViewHistory,
  onClose,
  saveStatus = 'saved',
}: AssessmentEditorLayoutProps) {
  const [showValidation, setShowValidation] = useState(true);
  const typeConfig = ASSESSMENT_TYPES[assessment.type];

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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Sticky */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        {/* Top Bar */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{typeConfig.name}</h1>
                <p className="text-sm text-gray-600">
                  {assessment.patientName} • Version {assessment.currentVersion}
                </p>
              </div>
              <Badge
                className={`ml-2 ${
                  assessment.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {assessment.status.replace('-', ' ')}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              <AssessmentAutosaveIndicator status={saveStatus} lastSaveTime={assessment.lastAutoSave} />
              
              <Button variant="outline" size="sm" onClick={onViewHistory}>
                <History className="w-4 h-4 mr-2" />
                History
              </Button>

              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>

              {assessment.isValid && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onSubmitSignature}>
                  <FileCheck className="w-4 h-4 mr-2" />
                  Submit for Signature
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Patient Info Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center gap-6 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Patient:</span>
              <span>{assessment.patientName}</span>
              <Badge variant="outline" className="text-xs">{assessment.patientId}</Badge>
            </div>
            {assessment.episodeId && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Episode:</span>
                <span>{assessment.episodeId}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Clinician:</span>
              <span>{assessment.createdBy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <AssessmentSectionNav
              sections={sections}
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
          </div>
        </div>

        {/* Center - Form Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {sections.find((s) => s.id === activeSection)?.title}
              </h2>
              {sections.find((s) => s.id === activeSection)?.subtitle && (
                <p className="text-gray-600 mt-1">
                  {sections.find((s) => s.id === activeSection)?.subtitle}
                </p>
              )}
            </div>

            {/* Form Content */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {children}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={!canGoPrevious}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous Section
              </Button>
              <span className="text-sm text-gray-600">
                Section {currentSectionIndex + 1} of {sections.length}
              </span>
              <Button
                onClick={handleNext}
                disabled={!canGoNext}
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
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
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
              <AssessmentValidationPanel
                issues={assessment.validationIssues}
                isValid={assessment.isValid}
                percentComplete={assessment.percentComplete}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Toolbar */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>
              Progress: <span className="font-medium">{assessment.percentComplete}%</span>
            </span>
            {assessment.validationIssues.length > 0 && (
              <>
                <span>•</span>
                <span className="text-red-600 font-medium">
                  {assessment.validationIssues.length} validation issue
                  {assessment.validationIssues.length !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!showValidation && (
              <Button variant="outline" size="sm" onClick={() => setShowValidation(true)}>
                Show Validation Panel
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
