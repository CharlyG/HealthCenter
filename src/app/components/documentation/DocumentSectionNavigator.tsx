/**
 * Document Section Navigator Component
 * 
 * Sidebar navigation for jumping between document sections.
 * Shows section progress and highlights incomplete sections.
 * 
 * Improves usability for complex multi-section documentation.
 */

import { memo } from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../ui/utils';
import { 
  FormSectionDef,
  SectionProgressData
} from '../../lib/documentationTypes';

interface DocumentSectionNavigatorProps {
  sections: FormSectionDef[];
  sectionProgress: Record<string, SectionProgressData>;
  currentSectionId: string;
  onNavigateToSection: (sectionId: string) => void;
  className?: string;
  vertical?: boolean;
}

export const DocumentSectionNavigator = memo<DocumentSectionNavigatorProps>(({ 
  sections,
  sectionProgress,
  currentSectionId,
  onNavigateToSection,
  className = '',
  vertical = true
}) => {
  return (
    <nav className={cn('bg-white border rounded-lg', className)}>
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm text-gray-900">
          Document Sections
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {sections.filter(s => sectionProgress[s.id]?.complete).length} of {sections.length} complete
        </p>
      </div>

      <ScrollArea className={vertical ? 'h-[calc(100vh-200px)]' : 'h-auto'}>
        <div className={cn(
          'p-2',
          vertical ? 'space-y-1' : 'flex gap-1 overflow-x-auto'
        )}>
          {sections.map((section, idx) => {
            const progress = sectionProgress[section.id];
            const isActive = currentSectionId === section.id;
            const isComplete = progress?.complete || false;
            const hasErrors = progress && progress.requiredFilled < progress.requiredTotal;

            return (
              <button
                key={section.id}
                onClick={() => onNavigateToSection(section.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left',
                  'hover:bg-gray-50',
                  isActive && 'bg-blue-50 border border-blue-200',
                  !isActive && !isComplete && hasErrors && 'border border-red-100'
                )}
              >
                {/* Section number and icon */}
                <div className="shrink-0">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                    isComplete && 'bg-green-100 text-green-700',
                    !isComplete && isActive && 'bg-blue-100 text-blue-700',
                    !isComplete && !isActive && 'bg-gray-100 text-gray-600'
                  )}>
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                </div>

                {/* Section info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={cn(
                      'font-medium text-sm truncate',
                      isActive && 'text-blue-900',
                      !isActive && 'text-gray-900'
                    )}>
                      {section.title}
                    </h4>
                    
                    {hasErrors && !isComplete && (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {section.description}
                  </p>

                  {/* Progress bar */}
                  {progress && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn(
                          'font-medium',
                          isComplete && 'text-green-600',
                          !isComplete && hasErrors && 'text-red-600',
                          !isComplete && !hasErrors && 'text-gray-600'
                        )}>
                          {progress.requiredFilled} / {progress.requiredTotal} required
                        </span>
                        <span className="text-gray-500">
                          {progress.filled} / {progress.total} fields
                        </span>
                      </div>
                      
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all rounded-full',
                            isComplete && 'bg-green-500',
                            !isComplete && hasErrors && 'bg-red-500',
                            !isComplete && !hasErrors && 'bg-blue-500'
                          )}
                          style={{
                            width: `${progress.requiredTotal > 0 
                              ? (progress.requiredFilled / progress.requiredTotal) * 100 
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </nav>
  );
});

DocumentSectionNavigator.displayName = 'DocumentSectionNavigator';

// ─── Compact Version ────────────────────────────────────────────────────────

interface CompactSectionNavigatorProps {
  sections: FormSectionDef[];
  sectionProgress: Record<string, SectionProgressData>;
  currentSectionId: string;
  onNavigateToSection: (sectionId: string) => void;
  className?: string;
}

export const CompactSectionNavigator = memo<CompactSectionNavigatorProps>(({ 
  sections,
  sectionProgress,
  currentSectionId,
  onNavigateToSection,
  className = ''
}) => {
  return (
    <nav className={cn('flex items-center gap-2 overflow-x-auto pb-2', className)}>
      {sections.map((section, idx) => {
        const progress = sectionProgress[section.id];
        const isActive = currentSectionId === section.id;
        const isComplete = progress?.complete || false;
        const hasErrors = progress && progress.requiredFilled < progress.requiredTotal;

        return (
          <button
            key={section.id}
            onClick={() => onNavigateToSection(section.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border whitespace-nowrap transition-all',
              'hover:bg-gray-50',
              isActive && 'bg-blue-50 border-blue-200',
              !isActive && isComplete && 'border-green-200 bg-green-50',
              !isActive && !isComplete && !hasErrors && 'border-gray-200',
              !isActive && !isComplete && hasErrors && 'border-red-200 bg-red-50'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
              isComplete && 'bg-green-200 text-green-700',
              !isComplete && isActive && 'bg-blue-200 text-blue-700',
              !isComplete && !isActive && 'bg-gray-200 text-gray-600'
            )}>
              {isComplete ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>
            
            <span className={cn(
              'text-sm font-medium',
              isActive && 'text-blue-900',
              !isActive && isComplete && 'text-green-900',
              !isActive && !isComplete && !hasErrors && 'text-gray-700',
              !isActive && !isComplete && hasErrors && 'text-red-900'
            )}>
              {section.title}
            </span>

            {hasErrors && !isComplete && (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
          </button>
        );
      })}
    </nav>
  );
});

CompactSectionNavigator.displayName = 'CompactSectionNavigator';

// ─── Mobile Dots Navigator ──────────────────────────────────────────────────

interface DotsSectionNavigatorProps {
  sections: FormSectionDef[];
  sectionProgress: Record<string, SectionProgressData>;
  currentSectionId: string;
  onNavigateToSection: (sectionId: string) => void;
  className?: string;
}

export const DotsSectionNavigator = memo<DotsSectionNavigatorProps>(({ 
  sections,
  sectionProgress,
  currentSectionId,
  onNavigateToSection,
  className = ''
}) => {
  return (
    <nav className={cn('flex items-center justify-center gap-2', className)}>
      {sections.map((section) => {
        const progress = sectionProgress[section.id];
        const isActive = currentSectionId === section.id;
        const isComplete = progress?.complete || false;

        return (
          <button
            key={section.id}
            onClick={() => onNavigateToSection(section.id)}
            className="p-1 group"
            title={section.title}
          >
            <div className={cn(
              'rounded-full transition-all',
              isActive && 'w-8 h-2',
              !isActive && 'w-2 h-2',
              isComplete && 'bg-green-500',
              !isComplete && isActive && 'bg-blue-500',
              !isComplete && !isActive && 'bg-gray-300 group-hover:bg-gray-400'
            )} />
          </button>
        );
      })}
    </nav>
  );
});

DotsSectionNavigator.displayName = 'DotsSectionNavigator';
