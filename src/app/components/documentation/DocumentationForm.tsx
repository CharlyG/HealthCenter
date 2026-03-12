/**
 * DocumentationForm — Main smart clinical documentation form.
 *
 * Features:
 * - Section-by-section navigation with progress tracking
 * - Auto-saving drafts with visual indicator
 * - Required field highlighting & validation
 * - Smart phrase insertion for narrative fields
 * - Previous documentation pattern reuse
 * - Overall and per-section progress ring/bars
 *
 * Performance: memoized sub-components, debounced autosave, stable callbacks.
 */
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import {
  Save,
  Send,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
} from 'lucide-react';

import { documentationGateway } from '../../lib/dataGateway';
import type {
  FormTemplate,
  FormSectionDef,
  FormFieldDef,
  FormValues,
  DocumentDraft,
  SectionProgressData,
} from '../../lib/documentationTypes';
import { computeOverallProgress } from '../../lib/documentationTypes';

import { FormProgressBar } from './FormProgressBar';
import { SectionProgress } from './SectionProgress';
import { SmartPhrasePopover } from './SmartPhrasePopover';
import { PreviousPatternPanel } from './PreviousPatternPanel';
import { SavePhraseDialog } from './SavePhraseDialog';
import { RequestCosignDialog, CosignTimeline } from './CosignaturePanel';
import { DocumentPrintView } from './DocumentPrintView';

// ─── Field Renderer ─────────────────────────────────────────────────────────

interface FieldRendererProps {
  field: FormFieldDef;
  value: string | boolean | number;
  onChange: (fieldId: string, value: string | boolean | number) => void;
  showValidation: boolean;
  patientId: string;
}

const FieldRenderer = React.memo(function FieldRenderer({
  field,
  value,
  onChange,
  showValidation,
  patientId,
}: FieldRendererProps) {
  const isEmpty = value === undefined || value === '' || value === false;
  const isInvalid = showValidation && field.required && isEmpty;

  const handleSmartPhraseInsert = useCallback(
    (text: string) => {
      // Append to existing value or set as new
      const current = (value as string) || '';
      const newVal = current ? `${current}\n\n${text}` : text;
      onChange(field.id, newVal);
    },
    [value, field.id, onChange]
  );

  const handlePatternInsert = useCallback(
    (text: string) => {
      onChange(field.id, text);
    },
    [field.id, onChange]
  );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={field.id}
          className={cn(
            'text-sm font-medium',
            isInvalid ? 'text-red-600' : 'text-gray-700'
          )}
        >
          {field.label}
          {field.required && (
            <span className={cn('ml-0.5', isInvalid ? 'text-red-500' : 'text-red-400')}>*</span>
          )}
        </Label>

        {/* Smart phrase button for textarea fields */}
        {field.type === 'textarea' && field.smartPhraseCategory && (
          <div className="flex items-center gap-1">
            <SmartPhrasePopover
              category={field.smartPhraseCategory}
              onInsert={handleSmartPhraseInsert}
              currentValue={(value as string) || ''}
            />
            {(value as string)?.length > 20 && (
              <SavePhraseDialog
                initialText={(value as string) || ''}
                category={field.smartPhraseCategory}
              />
            )}
          </div>
        )}
      </div>

      {field.helpText && (
        <p className="text-[10px] text-gray-400">{field.helpText}</p>
      )}

      {/* Render by type */}
      {field.type === 'text' && (
        <Input
          id={field.id}
          value={(value as string) || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className={cn('h-9', isInvalid && 'border-red-300 bg-red-50 focus-visible:border-red-400 focus-visible:ring-red-200')}
          maxLength={field.maxLength}
        />
      )}

      {field.type === 'textarea' && (
        <Textarea
          id={field.id}
          value={(value as string) || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className={cn(
            'min-h-[100px] text-sm leading-relaxed',
            isInvalid && 'border-red-300 bg-red-50 focus-visible:border-red-400 focus-visible:ring-red-200'
          )}
          maxLength={field.maxLength}
        />
      )}

      {field.type === 'number' && (
        <Input
          id={field.id}
          type="number"
          value={value !== undefined && value !== '' ? String(value) : ''}
          onChange={(e) => onChange(field.id, e.target.value === '' ? '' : e.target.value)}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          className={cn('h-9 w-32', isInvalid && 'border-red-300 bg-red-50 focus-visible:border-red-400 focus-visible:ring-red-200')}
        />
      )}

      {field.type === 'date' && (
        <Input
          id={field.id}
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={cn('h-9 w-48', isInvalid && 'border-red-300 bg-red-50 focus-visible:border-red-400 focus-visible:ring-red-200')}
        />
      )}

      {field.type === 'time' && (
        <Input
          id={field.id}
          type="time"
          value={(value as string) || ''}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={cn('h-9 w-40', isInvalid && 'border-red-300 bg-red-50 focus-visible:border-red-400 focus-visible:ring-red-200')}
        />
      )}

      {field.type === 'select' && (
        <Select
          value={(value as string) || ''}
          onValueChange={(v) => onChange(field.id, v)}
        >
          <SelectTrigger
            className={cn(
              'h-9 w-64',
              isInvalid && 'border-red-300 bg-red-50'
            )}
          >
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === 'checkbox' && (
        <div className="flex items-center gap-2">
          <Checkbox
            id={field.id}
            checked={Boolean(value)}
            onCheckedChange={(checked) => onChange(field.id, Boolean(checked))}
          />
          <Label htmlFor={field.id} className="text-sm text-gray-600 cursor-pointer">
            {field.placeholder || 'Yes'}
          </Label>
        </div>
      )}

      {/* Validation message */}
      {isInvalid && (
        <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
          <AlertTriangle className="size-2.5" />
          This field is required
        </p>
      )}

      {/* Character count for text areas */}
      {field.type === 'textarea' && field.maxLength && (value as string)?.length > 0 && (
        <p className={cn(
          'text-[9px] text-right',
          (value as string).length > field.maxLength * 0.9 ? 'text-amber-500' : 'text-gray-400'
        )}>
          {(value as string).length}/{field.maxLength}
        </p>
      )}

      {/* Previous pattern panel for narrative fields */}
      {field.type === 'textarea' && field.smartPhraseCategory && (
        <PreviousPatternPanel
          patientId={patientId}
          fieldId={field.id}
          fieldLabel={field.label}
          onInsert={handlePatternInsert}
        />
      )}
    </div>
  );
});

// ─── Auto-save Status ───────────────────────────────────────────────────────

const AutoSaveIndicator = React.memo(function AutoSaveIndicator({
  saving,
  lastSaved,
  isDirty,
}: {
  saving: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      {saving ? (
        <>
          <Loader2 className="size-3 animate-spin text-blue-500" />
          <span className="text-blue-600 font-medium">Saving draft...</span>
        </>
      ) : lastSaved ? (
        <>
          <CheckCircle2 className="size-3 text-emerald-500" />
          <span className="text-gray-500">
            Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isDirty && (
            <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-amber-200 text-amber-600 bg-amber-50">
              Unsaved changes
            </Badge>
          )}
        </>
      ) : isDirty ? (
        <>
          <Clock className="size-3 text-amber-500" />
          <span className="text-amber-600 font-medium">Unsaved changes</span>
        </>
      ) : (
        <span className="text-gray-400">No changes</span>
      )}
    </div>
  );
});

// ─── Main DocumentationForm Component ───────────────────────────────────────

interface DocumentationFormProps {
  patientId: string;
  template: FormTemplate;
  existingDraft?: DocumentDraft;
  onClose: () => void;
}

export default function DocumentationForm({
  patientId,
  template,
  existingDraft,
  onClose,
}: DocumentationFormProps) {
  // ─── State ──────────────────────────────────────────────────────────
  const [values, setValues] = useState<FormValues>(existingDraft?.values || {});
  const [activeSection, setActiveSection] = useState(template.sections[0]?.id || '');
  const [draftId, setDraftId] = useState<string | null>(existingDraft?.id || null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    existingDraft ? new Date(existingDraft.updatedAt) : null
  );
  const [isDirty, setIsDirty] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Progress ───────────────────────────────────────────────────────
  const { pct: overallPct, sectionProgress } = useMemo(
    () => computeOverallProgress(template.sections, values),
    [template.sections, values]
  );

  const currentSectionIdx = useMemo(
    () => template.sections.findIndex((s) => s.id === activeSection),
    [template.sections, activeSection]
  );

  const currentSection = template.sections[currentSectionIdx];
  const isFirstSection = currentSectionIdx === 0;
  const isLastSection = currentSectionIdx === template.sections.length - 1;

  // ─── Field Change Handler ───────────────────────────────────────────
  const handleFieldChange = useCallback(
    (fieldId: string, value: string | boolean | number) => {
      setValues((prev) => ({ ...prev, [fieldId]: value }));
      setIsDirty(true);
    },
    []
  );

  // ─── Auto-save (debounced 5s) ───────────────────────────────────────
  useEffect(() => {
    if (!isDirty) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      try {
        setSaving(true);
        const progressData = computeOverallProgress(template.sections, values);

        if (draftId) {
          await documentationGateway.saveDraft(draftId, {
            values,
            completionPct: progressData.pct,
            sectionProgress: progressData.sectionProgress,
            autoSaved: true,
          });
        } else {
          const res = await documentationGateway.createDraft({
            patientId,
            templateId: template.id,
            templateName: template.name,
            values,
          });
          setDraftId(res.draft.id);
        }
        setLastSaved(new Date());
        setIsDirty(false);
      } catch (err: any) {
        console.error('[DocumentationForm] Auto-save error:', err);
      } finally {
        setSaving(false);
      }
    }, 5000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [isDirty, values, draftId, patientId, template]);

  // ─── Manual Save ────────────────────────────────────────────────────
  const handleManualSave = useCallback(async () => {
    try {
      setSaving(true);
      const progressData = computeOverallProgress(template.sections, values);

      if (draftId) {
        await documentationGateway.saveDraft(draftId, {
          values,
          completionPct: progressData.pct,
          sectionProgress: progressData.sectionProgress,
        });
      } else {
        const res = await documentationGateway.createDraft({
          patientId,
          templateId: template.id,
          templateName: template.name,
          values,
        });
        setDraftId(res.draft.id);
      }
      setLastSaved(new Date());
      setIsDirty(false);
      toast.success('Draft saved successfully');
    } catch (err: any) {
      console.error('[DocumentationForm] Manual save error:', err);
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }, [values, draftId, patientId, template]);

  // ─── Submit (finalize) ──────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setShowValidation(true);

    // Check all required fields
    const allRequired = template.sections.flatMap((s) =>
      s.fields.filter((f) => f.required)
    );
    const missing = allRequired.filter((f) => {
      const v = values[f.id];
      return v === undefined || v === '' || v === false;
    });

    if (missing.length > 0) {
      // Navigate to first section with missing field
      for (const section of template.sections) {
        const sectionMissing = section.fields.filter(
          (f) => f.required && (values[f.id] === undefined || values[f.id] === '' || values[f.id] === false)
        );
        if (sectionMissing.length > 0) {
          setActiveSection(section.id);
          break;
        }
      }
      toast.error(`${missing.length} required field(s) incomplete. Please review highlighted fields.`);
      return;
    }

    try {
      setSubmitting(true);
      const progressData = computeOverallProgress(template.sections, values);
      const saveId = draftId || `draft-${Date.now()}`;

      await documentationGateway.saveDraft(saveId, {
        values,
        status: 'completed',
        completionPct: 100,
        sectionProgress: progressData.sectionProgress,
      });

      toast.success('Documentation submitted successfully');
      onClose();
    } catch (err: any) {
      console.error('[DocumentationForm] Submit error:', err);
      toast.error(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [values, draftId, template, onClose]);

  // ─── Section Navigation ─────────────────────────────────────────────
  const goToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
  }, []);

  const goNext = useCallback(() => {
    if (!isLastSection) {
      setActiveSection(template.sections[currentSectionIdx + 1].id);
    }
  }, [isLastSection, currentSectionIdx, template.sections]);

  const goPrev = useCallback(() => {
    if (!isFirstSection) {
      setActiveSection(template.sections[currentSectionIdx - 1].id);
    }
  }, [isFirstSection, currentSectionIdx, template.sections]);

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* ── Sticky Header ──────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">{template.name}</h2>
              </div>
              <p className="text-xs text-gray-500 ml-6">{template.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AutoSaveIndicator saving={saving} lastSaved={lastSaved} isDirty={isDirty} />

            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={saving || !isDirty}
              className="gap-1.5"
            >
              <Save className="size-3.5" />
              Save Draft
            </Button>

            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              {submitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Submit
            </Button>
          </div>
        </div>

        {/* Global progress bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-out',
                overallPct === 100
                  ? 'bg-emerald-500'
                  : overallPct >= 60
                  ? 'bg-blue-500'
                  : overallPct >= 30
                  ? 'bg-amber-500'
                  : 'bg-red-400'
              )}
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <span className={cn(
            'text-xs font-semibold shrink-0',
            overallPct === 100 ? 'text-emerald-600' : 'text-gray-600'
          )}>
            {overallPct}% complete
          </span>
        </div>
      </div>

      {/* ── Two-column Layout ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left: Progress sidebar */}
        <div className="w-64 shrink-0 border-r border-gray-200 bg-white overflow-auto p-4">
          <FormProgressBar
            sections={template.sections}
            sectionProgress={sectionProgress}
            overallPct={overallPct}
            activeSection={activeSection}
            onSectionClick={goToSection}
          />
        </div>

        {/* Right: Form content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto p-6 pb-24">
              {currentSection && (
                <div>
                  {/* Section header with progress */}
                  <SectionProgress
                    title={currentSection.title}
                    description={currentSection.description}
                    progress={sectionProgress[currentSection.id]}
                    isActive={true}
                    showValidation={showValidation}
                  />

                  {/* Fields */}
                  <div className="space-y-5">
                    {currentSection.fields.map((field) => (
                      <FieldRenderer
                        key={field.id}
                        field={field}
                        value={values[field.id]}
                        onChange={handleFieldChange}
                        showValidation={showValidation}
                        patientId={patientId}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Section navigation footer */}
          <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={isFirstSection}
              className="gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              Previous
            </Button>

            <div className="flex items-center gap-1.5">
              {template.sections.map((s, i) => {
                const sp = sectionProgress[s.id];
                const isComplete = sp?.complete ?? false;
                const isCurrent = s.id === activeSection;
                return (
                  <button
                    key={s.id}
                    onClick={() => goToSection(s.id)}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all',
                      isCurrent
                        ? 'w-6 bg-blue-600'
                        : isComplete
                        ? 'bg-emerald-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                    )}
                    title={s.title}
                  />
                );
              })}
            </div>

            {isLastSection ? (
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {submitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                Submit
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={goNext}
                className="gap-1.5"
              >
                Next
                <ArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}