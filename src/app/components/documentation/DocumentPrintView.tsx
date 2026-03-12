/**
 * DocumentPrintView — Generates a print-friendly view of a completed document
 * for PDF export via the browser's print dialog (Save as PDF).
 *
 * Renders the complete form data in a structured, professional clinical layout
 * with header, sections, signature blocks, and co-signature info.
 */
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { FileDown, Printer, CheckCircle2, Shield } from 'lucide-react';
import type { DocumentDraft, FormTemplate, FormSectionDef } from '../../lib/documentationTypes';

interface DocumentPrintViewProps {
  draft: DocumentDraft;
  template: FormTemplate;
  children?: React.ReactNode;
}

// ─── Print Content (rendered into an iframe for isolated printing) ───────────

interface PrintContentProps {
  draft: DocumentDraft;
  template: FormTemplate;
}

const PrintContent = React.memo(function PrintContent({ draft, template }: PrintContentProps) {
  const now = new Date().toLocaleString();

  const getDisplayValue = (field: any, value: any): string => {
    if (value === undefined || value === null || value === '') return '—';
    if (field.type === 'checkbox') return value ? 'Yes' : 'No';
    if (field.type === 'select' && field.options) {
      const opt = field.options.find((o: any) => o.value === String(value));
      return opt?.label || String(value);
    }
    return String(value);
  };

  return (
    <div className="p-8 max-w-[800px] mx-auto font-sans text-gray-900 bg-white" id="print-content">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{draft.templateName}</h1>
            <p className="text-sm text-gray-600 mt-1">Clinical Documentation Record</p>
          </div>
          <div className="text-right text-xs text-gray-600 space-y-0.5">
            <p><span className="font-semibold">Document ID:</span> {draft.id}</p>
            <p><span className="font-semibold">Patient ID:</span> {draft.patientId}</p>
            <p><span className="font-semibold">Created:</span> {new Date(draft.createdAt).toLocaleDateString()}</p>
            <p><span className="font-semibold">Last Modified:</span> {new Date(draft.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className={cn(
        'rounded-md px-4 py-2 mb-6 text-sm font-medium flex items-center gap-2',
        draft.status === 'cosigned' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
        draft.status === 'completed' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
        'bg-amber-50 text-amber-800 border border-amber-200'
      )}>
        {draft.status === 'cosigned' && <Shield className="size-4" />}
        {draft.status === 'completed' && <CheckCircle2 className="size-4" />}
        Status: {draft.status === 'cosigned' ? 'Completed & Co-Signed' :
                 draft.status === 'completed' ? 'Completed' :
                 draft.status === 'pending_cosign' ? 'Pending Co-Signature' :
                 'Draft'}
      </div>

      {/* Sections */}
      {template.sections.map((section: FormSectionDef) => {
        const hasData = section.fields.some(
          (f) => draft.values[f.id] !== undefined && draft.values[f.id] !== '' && draft.values[f.id] !== false
        );

        return (
          <div key={section.id} className="mb-6 break-inside-avoid">
            <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.fields.map((field) => {
                const value = draft.values[field.id];
                const displayVal = getDisplayValue(field, value);

                if (field.type === 'textarea') {
                  return (
                    <div key={field.id} className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-0.5">*</span>}
                      </p>
                      <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap min-h-[40px]">
                        {displayVal}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={field.id} className="flex items-baseline gap-2 text-sm">
                    <span className="text-xs font-semibold text-gray-700 w-48 shrink-0">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}:
                    </span>
                    <span className="text-sm">
                      {displayVal}
                      {field.type === 'number' && field.id === 'systolic_bp' && draft.values['diastolic_bp']
                        ? `/${draft.values['diastolic_bp']} mmHg` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Signature Block */}
      <div className="mt-8 border-t-2 border-gray-900 pt-4 space-y-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-6">Clinician Signature</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-sm font-medium">{draft.createdBy}</p>
            <p className="text-xs text-gray-500">
              Date: {new Date(draft.updatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Co-signature block */}
          {(draft.status === 'cosigned' || draft.status === 'pending_cosign') && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-6">Supervising Co-Signature</p>
              <div className="border-b border-gray-400 mb-1" />
              {draft.cosignedBy ? (
                <>
                  <p className="text-sm font-medium">{draft.cosignedBy}</p>
                  <p className="text-xs text-gray-500">
                    Date: {draft.cosignedAt ? new Date(draft.cosignedAt).toLocaleDateString() : '—'}
                  </p>
                  {draft.cosignComment && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      Comment: {draft.cosignComment}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">Pending: {draft.cosignRequestedTo}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-3 border-t border-gray-200 text-[10px] text-gray-400 flex items-center justify-between">
        <span>CONFIDENTIAL — Protected Health Information (PHI)</span>
        <span>Printed: {now}</span>
      </div>
    </div>
  );
});

// ─── Main Export Dialog ─────────────────────────────────────────────────────

export const DocumentPrintView = React.memo(function DocumentPrintView({
  draft,
  template,
  children,
}: DocumentPrintViewProps) {
  const [open, setOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank', 'width=800,height=1100');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups for PDF export.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${draft.templateName} - ${draft.patientId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; background: white; }
          @page { margin: 0.75in; size: letter; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
          .p-8 { padding: 2rem; }
          .max-w-\\[800px\\] { max-width: 800px; }
          .mx-auto { margin-left: auto; margin-right: auto; }
          .font-sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .text-gray-900 { color: #111827; }
          .text-gray-800 { color: #1f2937; }
          .text-gray-700 { color: #374151; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-500 { color: #6b7280; }
          .text-gray-400 { color: #9ca3af; }
          .text-red-500 { color: #ef4444; }
          .text-emerald-800 { color: #065f46; }
          .text-blue-800 { color: #1e40af; }
          .text-amber-800 { color: #92400e; }
          .bg-white { background: white; }
          .bg-gray-50 { background: #f9fafb; }
          .bg-emerald-50 { background: #ecfdf5; }
          .bg-blue-50 { background: #eff6ff; }
          .bg-amber-50 { background: #fffbeb; }
          .border { border: 1px solid #e5e7eb; }
          .border-gray-200 { border-color: #e5e7eb; }
          .border-gray-300 { border-color: #d1d5db; }
          .border-gray-400 { border-color: #9ca3af; }
          .border-gray-900 { border-color: #111827; }
          .border-emerald-200 { border-color: #a7f3d0; }
          .border-blue-200 { border-color: #bfdbfe; }
          .border-amber-200 { border-color: #fde68a; }
          .border-b { border-bottom: 1px solid; }
          .border-b-2 { border-bottom: 2px solid; }
          .border-t { border-top: 1px solid; }
          .border-t-2 { border-top: 2px solid; }
          .rounded { border-radius: 4px; }
          .rounded-md { border-radius: 6px; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-base { font-size: 1rem; line-height: 1.5rem; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .text-\\[10px\\] { font-size: 10px; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .italic { font-style: italic; }
          .tracking-tight { letter-spacing: -0.025em; }
          .leading-relaxed { line-height: 1.625; }
          .whitespace-pre-wrap { white-space: pre-wrap; }
          .flex { display: flex; }
          .items-start { align-items: flex-start; }
          .items-center { align-items: center; }
          .items-baseline { align-items: baseline; }
          .justify-between { justify-content: space-between; }
          .gap-2 { gap: 0.5rem; }
          .gap-8 { gap: 2rem; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .space-y-0\\.5 > * + * { margin-top: 0.125rem; }
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .space-y-6 > * + * { margin-top: 1.5rem; }
          .text-right { text-align: right; }
          .w-48 { width: 12rem; }
          .shrink-0 { flex-shrink: 0; }
          .min-h-\\[40px\\] { min-height: 40px; }
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mt-1 { margin-top: 0.25rem; }
          .mt-8 { margin-top: 2rem; }
          .ml-0\\.5 { margin-left: 0.125rem; }
          .pb-1 { padding-bottom: 0.25rem; }
          .pb-4 { padding-bottom: 1rem; }
          .pt-3 { padding-top: 0.75rem; }
          .pt-4 { padding-top: 1rem; }
          .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .break-inside-avoid { break-inside: avoid; }
          svg { display: inline-block; vertical-align: middle; width: 1rem; height: 1rem; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for content to render, then print
    setTimeout(() => {
      printWindow.print();
      // Don't close — let the user close the tab after saving PDF
    }, 500);
  }, [draft.templateName, draft.patientId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <FileDown className="size-3.5" />
            Export PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Printer className="size-5 text-blue-600" />
            Document Preview & Export
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="shrink-0 flex items-center justify-between py-2 border-b border-gray-200">
          <p className="text-xs text-gray-500">
            Preview your document below. Click &ldquo;Print / Save as PDF&rdquo; to export.
          </p>
          <Button
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="size-3.5" />
            Print / Save as PDF
          </Button>
        </div>

        {/* Scrollable preview */}
        <div className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-gray-100 p-4">
          <div
            ref={printRef}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <PrintContent draft={draft} template={template} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default DocumentPrintView;
