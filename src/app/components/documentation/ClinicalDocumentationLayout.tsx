/**
 * Clinical Documentation Layout Component
 * 
 * Master layout for all clinical documentation that integrates:
 * - Document Header (patient info, status, clinician)
 * - Section Navigator (sidebar with section list)
 * - Document Content (form sections)
 * - Progress Tracker (overall completion)
 * - Validation Panel (errors and warnings)
 * 
 * Supports all three documentation categories:
 * - Visit Documentation
 * - Assessment Documentation
 * - Episode Documentation
 * 
 * Mobile responsive with collapsible navigation.
 */

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Save, 
  Send, 
  FileSignature,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { DocumentHeader } from './DocumentHeader';
import { DocumentSectionNavigator, CompactSectionNavigator } from './DocumentSectionNavigator';
import { ValidationPanel } from './ValidationPanel';
import {
  ClinicalDocument,
  DocumentTemplate,
  FormValues,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  computeSectionProgress,
  computeOverallProgress
} from '../../lib/documentationTypes';
import { cn } from '../ui/utils';

interface ClinicalDocumentationLayoutProps {
  document: ClinicalDocument;
  template: DocumentTemplate;
  onSave: (values: FormValues) => Promise<void>;
  onSubmit: (values: FormValues) => Promise<void>;
  onSign?: (values: FormValues) => Promise<void>;
  renderSectionContent: (sectionId: string, values: FormValues, onChange: (updates: Partial<FormValues>) => void) => React.ReactNode;
  autoSaveIntervalMs?: number;
  className?: string;
}

export const ClinicalDocumentationLayout = memo<ClinicalDocumentationLayoutProps>(({
  document,
  template,
  onSave,
  onSubmit,
  onSign,
  renderSectionContent,
  autoSaveIntervalMs = 30000,
  className = ''
}) => {
  const [values, setValues] = useState<FormValues>(document.values);
  const [currentSectionId, setCurrentSectionId] = useState(template.sections[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Compute progress
  const { pct, sectionProgress } = useMemo(() => 
    computeOverallProgress(template.sections, values),
    [template.sections, values]
  );

  // Compute validation
  const validationResult = useMemo<ValidationResult>(() => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const missingRequiredFields: ValidationResult['missingRequiredFields'] = [];

    template.sections.forEach(section => {
      section.fields.forEach(field => {
        const value = values[field.id];
        const isFilled = value !== undefined && value !== '' && value !== false;

        // Required field validation
        if (field.required && !isFilled) {
          errors.push({
            id: `${section.id}_${field.id}_required`,
            severity: 'error',
            sectionId: section.id,
            sectionTitle: section.title,
            fieldId: field.id,
            fieldLabel: field.label,
            message: 'This field is required',
            rule: 'required'
          });

          missingRequiredFields.push({
            sectionId: section.id,
            sectionTitle: section.title,
            fieldId: field.id,
            fieldLabel: field.label
          });
        }

        // Custom validation rules
        if (field.validationRules?.custom && isFilled) {
          const errorMessage = field.validationRules.custom(value);
          if (errorMessage) {
            errors.push({
              id: `${section.id}_${field.id}_custom`,
              severity: 'error',
              sectionId: section.id,
              sectionTitle: section.title,
              fieldId: field.id,
              fieldLabel: field.label,
              message: errorMessage,
              rule: 'custom'
            });
          }
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completionPercentage: pct,
      missingRequiredFields
    };
  }, [template.sections, values, pct]);

  // Auto-save
  useEffect(() => {
    if (autoSaveIntervalMs <= 0) return;

    const interval = setInterval(async () => {
      if (Object.keys(values).length > 0) {
        await handleSave();
      }
    }, autoSaveIntervalMs);

    return () => clearInterval(interval);
  }, [values, autoSaveIntervalMs]);

  // Handle value changes
  const handleValuesChange = useCallback((updates: Partial<FormValues>) => {
    setValues(prev => ({ ...prev, ...updates }));
  }, []);

  // Save handler
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(values);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, values]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!validationResult.isValid) {
      setShowValidation(true);
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSubmit, values, validationResult]);

  // Sign handler
  const handleSign = useCallback(async () => {
    if (!validationResult.isValid) {
      setShowValidation(true);
      return;
    }

    if (!onSign) return;

    setIsSaving(true);
    try {
      await onSign(values);
    } catch (error) {
      console.error('Failed to sign:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSign, values, validationResult]);

  // Section navigation
  const currentSectionIndex = template.sections.findIndex(s => s.id === currentSectionId);
  const canGoBack = currentSectionIndex > 0;
  const canGoNext = currentSectionIndex < template.sections.length - 1;

  const goToPreviousSection = useCallback(() => {
    if (canGoBack) {
      setCurrentSectionId(template.sections[currentSectionIndex - 1].id);
    }
  }, [canGoBack, template.sections, currentSectionIndex]);

  const goToNextSection = useCallback(() => {
    if (canGoNext) {
      setCurrentSectionId(template.sections[currentSectionIndex + 1].id);
    }
  }, [canGoNext, template.sections, currentSectionIndex]);

  const handleNavigateToField = useCallback((sectionId: string, fieldId: string) => {
    setCurrentSectionId(sectionId);
    setShowValidation(false);
    // Scroll to field after a small delay to allow section to render
    setTimeout(() => {
      const element = document.getElementById(`field-${fieldId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  const currentSection = template.sections.find(s => s.id === currentSectionId);

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Document Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1800px] mx-auto p-4">
          <DocumentHeader document={document} compact />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">
                  Document Progress
                </span>
                <span className="font-semibold text-blue-600">
                  {pct}%
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>

            {/* Auto-save indicator */}
            <div className="text-xs text-gray-500 shrink-0">
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Saving...
                </span>
              ) : lastSaved ? (
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              ) : null}
            </div>

            {/* Validation status */}
            <Badge 
              variant={validationResult.isValid ? 'default' : 'destructive'}
              className="shrink-0"
            >
              {validationResult.isValid ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : (
                <AlertCircle className="w-3 h-3 mr-1" />
              )}
              {validationResult.errors.length} error{validationResult.errors.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-4">
              <DocumentSectionNavigator
                sections={template.sections}
                sectionProgress={sectionProgress}
                currentSectionId={currentSectionId}
                onNavigateToSection={setCurrentSectionId}
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Menu className="w-4 h-4 mr-2" />
                  Navigate Sections
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <DocumentSectionNavigator
                  sections={template.sections}
                  sectionProgress={sectionProgress}
                  currentSectionId={currentSectionId}
                  onNavigateToSection={(id) => {
                    setCurrentSectionId(id);
                    setMobileNavOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Document Content */}
          <div className="lg:col-span-6 space-y-4">
            {/* Current Section */}
            {currentSection && (
              <Card>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">
                        Section {currentSectionIndex + 1} of {template.sections.length}
                      </Badge>
                      {sectionProgress[currentSection.id]?.complete && (
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {currentSection.title}
                    </h2>
                    <p className="text-gray-600">
                      {currentSection.description}
                    </p>
                  </div>

                  {/* Section Content */}
                  {renderSectionContent(currentSection.id, values, handleValuesChange)}
                </div>

                {/* Section Navigation Footer */}
                <div className="border-t p-4 flex items-center justify-between bg-gray-50">
                  <Button
                    variant="outline"
                    onClick={goToPreviousSection}
                    disabled={!canGoBack}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <CompactSectionNavigator
                    sections={template.sections}
                    sectionProgress={sectionProgress}
                    currentSectionId={currentSectionId}
                    onNavigateToSection={setCurrentSectionId}
                    className="hidden md:flex"
                  />

                  <Button
                    variant="outline"
                    onClick={goToNextSection}
                    disabled={!canGoNext}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>

                {validationResult.isValid ? (
                  <>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Document
                    </Button>

                    {onSign && (
                      <Button
                        onClick={handleSign}
                        disabled={isSaving}
                        className="flex-1"
                      >
                        <FileSignature className="w-4 h-4 mr-2" />
                        Sign Document
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => setShowValidation(true)}
                    className="flex-1"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {validationResult.errors.length} Validation Error{validationResult.errors.length !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Validation Panel */}
          <div className="lg:col-span-3">
            <div className="sticky top-32">
              <ValidationPanel
                validationResult={validationResult}
                onNavigateToField={handleNavigateToField}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ClinicalDocumentationLayout.displayName = 'ClinicalDocumentationLayout';
