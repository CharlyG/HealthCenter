/**
 * AssistantTrigger — floating button that opens the AI Clinical Assistant panel.
 * Appears in the patient chart with a subtle pulsing indicator.
 */
import React from 'react';
import { cn } from '../ui/utils';
import { Brain, Sparkles } from 'lucide-react';

interface AssistantTriggerProps {
  onClick: () => void;
  isOpen: boolean;
  hasInsights?: boolean;
  insightCount?: number;
}

export const AssistantTrigger = React.memo(function AssistantTrigger({
  onClick,
  isOpen,
  hasInsights = false,
  insightCount = 0,
}: AssistantTriggerProps) {
  if (isOpen) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'flex items-center gap-2.5 px-4 py-3 rounded-2xl',
        'bg-gradient-to-r from-violet-600 to-indigo-600',
        'hover:from-violet-700 hover:to-indigo-700',
        'text-white shadow-lg shadow-indigo-500/25',
        'transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30',
        'group'
      )}
      title="Open AI Clinical Assistant"
    >
      {/* Pulse ring */}
      {hasInsights && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 text-[8px] font-bold text-amber-900 items-center justify-center">
            {insightCount > 9 ? '9+' : insightCount}
          </span>
        </span>
      )}

      <Brain className="size-5 group-hover:scale-110 transition-transform" />
      <span className="text-sm font-semibold">AI Assistant</span>
      <Sparkles className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
    </button>
  );
});

export default AssistantTrigger;
