/**
 * FormProgressBar — Overall form completion indicator with section breakdown.
 * Shows a ring chart + section-level progress bars.
 */
import React, { useMemo } from 'react';
import { cn } from '../ui/utils';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import type { FormSectionDef, SectionProgressData } from '../../lib/documentationTypes';

interface FormProgressBarProps {
  sections: FormSectionDef[];
  sectionProgress: Record<string, SectionProgressData>;
  overallPct: number;
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

// Ring chart SVG
const ProgressRing = React.memo(function ProgressRing({ pct }: { pct: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct === 100 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 30 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{pct}%</span>
        <span className="text-[9px] text-gray-500 font-medium">Complete</span>
      </div>
    </div>
  );
});

export const FormProgressBar = React.memo(function FormProgressBar({
  sections,
  sectionProgress,
  overallPct,
  activeSection,
  onSectionClick,
}: FormProgressBarProps) {
  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      {/* Overall ring */}
      <ProgressRing pct={overallPct} />

      {/* Section breakdown */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">
          Sections
        </p>
        {sortedSections.map((section) => {
          const sp = sectionProgress[section.id];
          const isActive = activeSection === section.id;
          const isComplete = sp?.complete ?? false;
          const reqPct = sp && sp.requiredTotal > 0
            ? Math.round((sp.requiredFilled / sp.requiredTotal) * 100)
            : (sp ? 100 : 0);
          const hasMissing = sp && sp.requiredFilled < sp.requiredTotal;

          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all',
                isActive
                  ? 'bg-blue-50 ring-1 ring-blue-200'
                  : 'hover:bg-gray-50'
              )}
            >
              {/* Status icon */}
              {isComplete ? (
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              ) : hasMissing ? (
                <AlertCircle className="size-4 text-amber-500 shrink-0" />
              ) : (
                <Circle className="size-4 text-gray-300 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn(
                    'text-xs font-medium truncate',
                    isActive ? 'text-blue-700' : 'text-gray-700'
                  )}>
                    {section.title}
                  </span>
                  <span className={cn(
                    'text-[10px] ml-2 shrink-0',
                    isComplete ? 'text-emerald-600 font-semibold' : 'text-gray-400'
                  )}>
                    {sp ? `${sp.requiredFilled}/${sp.requiredTotal}` : '0/0'}
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isComplete ? 'bg-emerald-500' : reqPct >= 50 ? 'bg-blue-500' : 'bg-amber-400'
                    )}
                    style={{ width: `${reqPct}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default FormProgressBar;
