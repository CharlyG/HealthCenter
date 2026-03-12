/**
 * PatientDocumentation — Smart documentation workspace.
 * Shows existing drafts and completed forms, with the ability
 * to start a new form or resume a draft.
 *
 * Enhancements:
 * - Co-signature workflow (request, review, approve/reject)
 * - PDF export for completed documents
 * - Pending co-sign section with action buttons
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { cn } from '../../ui/utils';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  FileEdit,
  Sparkles,
  ClipboardList,
  ArrowRight,
  Loader2,
  FolderOpen,
  Shield,
  UserCheck,
  FileDown,
  History,
} from 'lucide-react';

import { documentationGateway } from '../../../lib/dataGateway';
import type { DocumentDraft, FormTemplateType } from '../../../lib/documentationTypes';
import { FORM_TEMPLATES, getTemplate } from '../../../lib/documentationTemplates';
import DocumentationForm from '../../documentation/DocumentationForm';
import { RequestCosignDialog, CosignActionDialog, CosignStatusBadge, CosignTimeline } from '../../documentation/CosignaturePanel';
import { DocumentPrintView } from '../../documentation/DocumentPrintView';
import { AuditTrailPanel } from '../../documentation/AuditTrailPanel';

// ─── Draft Card ─────────────────────────────────────────────────────────────

interface DraftCardProps {
  draft: DocumentDraft;
  onResume: (draft: DocumentDraft) => void;
  onDraftUpdate: (draft: DocumentDraft) => void;
}

const DraftCard = React.memo(function DraftCard({ draft, onResume, onDraftUpdate }: DraftCardProps) {
  const isCompleted = draft.status === 'completed';
  const isSigned = draft.status === 'signed';
  const isCosigned = draft.status === 'cosigned';
  const isPendingCosign = draft.status === 'pending_cosign';
  const isFinalized = isCompleted || isSigned || isCosigned || isPendingCosign;
  const updatedDate = new Date(draft.updatedAt);

  const template = getTemplate(draft.templateId);

  return (
    <Card
      className={cn(
        'group transition-all hover:shadow-md border',
        isCosigned ? 'border-emerald-200 bg-emerald-50/30' :
        isPendingCosign ? 'border-indigo-200 bg-indigo-50/30' :
        isCompleted ? 'border-blue-200 bg-blue-50/30' :
        isSigned ? 'border-blue-200 bg-blue-50/30' :
        'border-gray-200 hover:border-blue-300 cursor-pointer'
      )}
      onClick={() => !isFinalized && onResume(draft)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center',
              isCosigned ? 'bg-emerald-100' :
              isPendingCosign ? 'bg-indigo-100' :
              isCompleted ? 'bg-blue-100' :
              isSigned ? 'bg-blue-100' :
              'bg-amber-100'
            )}>
              {isCosigned ? (
                <Shield className="size-4.5 text-emerald-600" />
              ) : isPendingCosign ? (
                <UserCheck className="size-4.5 text-indigo-600" />
              ) : isCompleted ? (
                <CheckCircle2 className="size-4.5 text-blue-600" />
              ) : isSigned ? (
                <FileText className="size-4.5 text-blue-600" />
              ) : (
                <FileEdit className="size-4.5 text-amber-600" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {draft.templateName}
              </h4>
              <p className="text-[10px] text-gray-500">
                by {draft.createdBy}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <CosignStatusBadge draft={draft} />
            {!isPendingCosign && !isCosigned && (
              <Badge
                variant="outline"
                className={cn(
                  'text-[9px] h-5 capitalize',
                  isCompleted ? 'bg-blue-50 border-blue-200 text-blue-700' :
                  isSigned ? 'bg-blue-50 border-blue-200 text-blue-700' :
                  'bg-amber-50 border-amber-200 text-amber-700'
                )}
              >
                {draft.status.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>

        {/* Co-sign timeline */}
        <CosignTimeline draft={draft} />

        {/* Progress bar for in-progress */}
        {!isFinalized && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">Progress</span>
              <span className={cn(
                'text-[10px] font-semibold',
                draft.completionPct >= 80 ? 'text-emerald-600' :
                draft.completionPct >= 40 ? 'text-blue-600' :
                'text-amber-600'
              )}>
                {draft.completionPct}%
              </span>
            </div>
            <Progress value={draft.completionPct} className="h-1.5" />
          </div>
        )}

        {/* Footer with actions */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <Clock className="size-3" />
            <span>
              {updatedDate.toLocaleDateString()} at{' '}
              {updatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Audit trail for any finalized document */}
            {isFinalized && (
              <AuditTrailPanel draftId={draft.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 gap-1 text-gray-400 hover:text-gray-600"
                >
                  <History className="size-3" />
                  <span className="text-[10px]">Audit</span>
                </Button>
              </AuditTrailPanel>
            )}

            {/* PDF Export for completed/cosigned docs */}
            {(isCompleted || isCosigned) && template && (
              <DocumentPrintView draft={draft} template={template}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 gap-1 text-gray-500 hover:text-blue-600"
                >
                  <FileDown className="size-3" />
                  <span className="text-[10px]">PDF</span>
                </Button>
              </DocumentPrintView>
            )}

            {/* Request co-sign for completed docs */}
            {isCompleted && (
              <RequestCosignDialog
                draftId={draft.id}
                onSuccess={onDraftUpdate}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 gap-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  <UserCheck className="size-3" />
                  <span className="text-[10px]">Co-Sign</span>
                </Button>
              </RequestCosignDialog>
            )}

            {/* Review & co-sign for pending docs (supervisor view) */}
            {isPendingCosign && (
              <CosignActionDialog draft={draft} onSuccess={onDraftUpdate} />
            )}

            {/* Resume for in-progress */}
            {!isFinalized && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600"
                onClick={() => onResume(draft)}
              >
                Resume
                <ArrowRight className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Template Card ──────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: { id: FormTemplateType; name: string; description: string; sections: any[] };
  onStart: (templateId: FormTemplateType) => void;
}

const TemplateCard = React.memo(function TemplateCard({ template, onStart }: TemplateCardProps) {
  const sectionCount = template.sections.length;
  const fieldCount = template.sections.reduce((sum: number, s: any) => sum + s.fields.length, 0);
  const requiredCount = template.sections.reduce(
    (sum: number, s: any) => sum + s.fields.filter((f: any) => f.required).length,
    0
  );

  return (
    <Card className="group transition-all hover:shadow-md hover:border-blue-300 cursor-pointer"
          onClick={() => onStart(template.id)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <ClipboardList className="size-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
              {template.name}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {template.description}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-gray-400">{sectionCount} sections</span>
              <span className="text-[10px] text-gray-400">{fieldCount} fields</span>
              <span className="text-[10px] text-amber-500 font-medium">{requiredCount} required</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity gap-1.5 shrink-0"
          >
            <Plus className="size-3.5" />
            Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────

interface PatientDocumentationProps {
  patientId: string;
}

export default function PatientDocumentation({ patientId }: PatientDocumentationProps) {
  const [drafts, setDrafts] = useState<DocumentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<{
    template: ReturnType<typeof getTemplate>;
    draft?: DocumentDraft;
  } | null>(null);

  // ─── Load Drafts ──────────────────────────────────────────────────
  const loadDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await documentationGateway.getDrafts(patientId);
      setDrafts(res.drafts || []);
    } catch (err: any) {
      console.error('[PatientDocumentation] Load error:', err);
      toast.error(`Failed to load drafts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleStartNew = useCallback((templateId: FormTemplateType) => {
    const tmpl = getTemplate(templateId);
    if (tmpl) {
      setActiveForm({ template: tmpl });
    }
  }, []);

  const handleResumeDraft = useCallback((draft: DocumentDraft) => {
    const tmpl = getTemplate(draft.templateId);
    if (tmpl) {
      setActiveForm({ template: tmpl, draft });
    }
  }, []);

  const handleCloseForm = useCallback(() => {
    setActiveForm(null);
    loadDrafts();
  }, [loadDrafts]);

  const handleDraftUpdate = useCallback((updatedDraft: DocumentDraft) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === updatedDraft.id ? updatedDraft : d))
    );
  }, []);

  // ─── Derived data ─────────────────────────────────────────────────
  const inProgressDrafts = useMemo(
    () => drafts.filter((d) => d.status === 'in_progress'),
    [drafts]
  );

  const pendingCosignDrafts = useMemo(
    () => drafts.filter((d) => d.status === 'pending_cosign'),
    [drafts]
  );

  const completedDrafts = useMemo(
    () => drafts.filter((d) => d.status === 'completed'),
    [drafts]
  );

  const cosignedDrafts = useMemo(
    () => drafts.filter((d) => d.status === 'cosigned' || d.status === 'signed'),
    [drafts]
  );

  // ─── Render: Active Form ──────────────────────────────────────────
  if (activeForm?.template) {
    return (
      <div className="-m-6 h-[calc(100%+3rem)]">
        <DocumentationForm
          patientId={patientId}
          template={activeForm.template}
          existingDraft={activeForm.draft}
          onClose={handleCloseForm}
        />
      </div>
    );
  }

  // ─── Render: Dashboard ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <FileText className="size-6 text-blue-600" />
            Documentation
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Smart clinical documentation with auto-save, progress tracking, and phrase assistance
          </p>
        </div>
      </div>

      {/* Smart features banner */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Smart Documentation Assistant</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Auto-saving drafts • Required field validation • Smart phrases (system & personal) • Pattern reuse • Co-signature workflow • PDF export
            </p>
          </div>
        </div>
      </div>

      {/* New Document Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4 text-blue-600" />
            New Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FORM_TEMPLATES.map((tmpl) => (
            <TemplateCard
              key={tmpl.id}
              template={tmpl}
              onStart={handleStartNew}
            />
          ))}
        </CardContent>
      </Card>

      {/* Draft Sections */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading drafts...</span>
        </div>
      ) : (
        <>
          {/* Pending Co-Signature */}
          {pendingCosignDrafts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="size-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Awaiting Co-Signature
                </h3>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-indigo-50 border-indigo-200 text-indigo-700">
                  {pendingCosignDrafts.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {pendingCosignDrafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    onResume={handleResumeDraft}
                    onDraftUpdate={handleDraftUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {inProgressDrafts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileEdit className="size-4 text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  In Progress
                </h3>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-amber-50 border-amber-200 text-amber-700">
                  {inProgressDrafts.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {inProgressDrafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    onResume={handleResumeDraft}
                    onDraftUpdate={handleDraftUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed (not yet co-signed) */}
          {completedDrafts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="size-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Completed
                </h3>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 border-blue-200 text-blue-700">
                  {completedDrafts.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {completedDrafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    onResume={handleResumeDraft}
                    onDraftUpdate={handleDraftUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Co-signed / Finalized */}
          {cosignedDrafts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="size-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Co-Signed & Finalized
                </h3>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-emerald-50 border-emerald-200 text-emerald-700">
                  {cosignedDrafts.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {cosignedDrafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    onResume={handleResumeDraft}
                    onDraftUpdate={handleDraftUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {drafts.length === 0 && (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
              <FolderOpen className="size-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No documentation yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Start a new document from the templates above
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}