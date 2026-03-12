/**
 * PreviousPatternPanel — Shows previous documentation patterns
 * for a given patient and field, allowing clinicians to reuse text.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { History, Copy, Check, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { documentationGateway } from '../../lib/dataGateway';
import type { DocumentationPattern } from '../../lib/documentationTypes';

interface PreviousPatternPanelProps {
  patientId: string;
  fieldId: string;
  fieldLabel: string;
  onInsert: (text: string) => void;
}

export const PreviousPatternPanel = React.memo(function PreviousPatternPanel({
  patientId,
  fieldId,
  fieldLabel,
  onInsert,
}: PreviousPatternPanelProps) {
  const [patterns, setPatterns] = useState<DocumentationPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!expanded) return;
    setLoading(true);
    documentationGateway
      .getPatterns(patientId, fieldId)
      .then((res) => setPatterns(res.patterns || []))
      .catch((err) => console.error('[PreviousPatterns] Load error:', err))
      .finally(() => setLoading(false));
  }, [expanded, patientId, fieldId]);

  const handleInsert = useCallback(
    (pattern: DocumentationPattern) => {
      onInsert(pattern.value);
      setCopiedId(pattern.id);
      setTimeout(() => setCopiedId(null), 2000);
    },
    [onInsert]
  );

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-blue-600 transition-colors"
        type="button"
      >
        <History className="size-3" />
        <span>Previous entries</span>
        <ChevronDown className="size-2.5" />
      </button>
    );
  }

  return (
    <div className="border border-blue-100 bg-blue-50/50 rounded-lg p-2.5 mt-1.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <History className="size-3.5 text-blue-600" />
          <span className="text-[11px] font-semibold text-blue-700">
            Previous: {fieldLabel}
          </span>
          <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-blue-200 text-blue-600">
            {patterns.length}
          </Badge>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
          type="button"
        >
          <ChevronUp className="size-3.5" />
        </button>
      </div>

      {loading ? (
        <p className="text-[10px] text-gray-500 py-2 text-center">Loading previous entries...</p>
      ) : patterns.length === 0 ? (
        <div className="text-center py-3">
          <FileText className="size-5 text-gray-300 mx-auto mb-1" />
          <p className="text-[10px] text-gray-500">No previous entries for this field</p>
        </div>
      ) : (
        <ScrollArea className="max-h-36">
          <div className="space-y-1.5">
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
                className="bg-white rounded-md p-2 border border-blue-100 group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-gray-400">
                    {pattern.documentDate} — {pattern.clinicianName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleInsert(pattern)}
                    type="button"
                  >
                    {copiedId === pattern.id ? (
                      <Check className="size-2.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-2.5 text-blue-500" />
                    )}
                    <span className="text-[9px]">
                      {copiedId === pattern.id ? 'Inserted' : 'Use'}
                    </span>
                  </Button>
                </div>
                <p className="text-[10px] text-gray-700 leading-relaxed line-clamp-3">
                  {pattern.value}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
});

export default PreviousPatternPanel;
