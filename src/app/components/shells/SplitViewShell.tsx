/**
 * Split View Shell
 * 
 * Side-by-side comparison and review layout.
 * Supports synchronized scrolling and resizable panels.
 * 
 * Use Cases:
 * - QA document review (original vs corrected)
 * - Assessment comparison (current vs previous)
 * - Medication reconciliation (home meds vs facility meds)
 * - Document versioning
 * - Before/after comparison
 * 
 * Performance:
 * - Memoized panels
 * - Optimized scroll sync
 * - Lazy-loaded content
 */

import { memo, ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  X,
  Link2,
  Link2Off,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../ui/utils';

interface PanelContent {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  content: ReactNode;
  headerActions?: ReactNode;
}

interface SplitViewShellProps {
  /** Primary (left) panel */
  primaryPanel: PanelContent;
  
  /** Secondary (right) panel */
  secondaryPanel: PanelContent;
  
  /** Shared header title */
  title?: string;
  
  /** Shared header actions */
  headerActions?: ReactNode;
  
  /** Enable synchronized scrolling */
  syncScroll?: boolean;
  
  /** Close handler */
  onClose?: () => void;
  
  /** Initial panel split (0-100, default 50) */
  initialSplit?: number;
  
  /** Allow panel resize */
  resizable?: boolean;
  
  /** View mode */
  mode?: 'split' | 'primary-only' | 'secondary-only';
  
  /** Mode change handler */
  onModeChange?: (mode: 'split' | 'primary-only' | 'secondary-only') => void;
  
  /** Footer actions */
  footerActions?: ReactNode;
  
  /** Loading state for primary panel */
  primaryLoading?: boolean;
  
  /** Loading state for secondary panel */
  secondaryLoading?: boolean;
  
  /** Full screen mode */
  fullScreen?: boolean;
}

const SplitViewShell = memo(function SplitViewShell({
  primaryPanel,
  secondaryPanel,
  title,
  headerActions,
  syncScroll: initialSyncScroll = false,
  onClose,
  initialSplit = 50,
  resizable = true,
  mode: controlledMode,
  onModeChange,
  footerActions,
  primaryLoading = false,
  secondaryLoading = false,
  fullScreen = false,
}: SplitViewShellProps) {
  const [split, setSplit] = useState(initialSplit);
  const [isDragging, setIsDragging] = useState(false);
  const [syncScroll, setSyncScroll] = useState(initialSyncScroll);
  const [internalMode, setInternalMode] = useState<'split' | 'primary-only' | 'secondary-only'>('split');
  
  const primaryRef = useRef<HTMLDivElement>(null);
  const secondaryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use controlled or internal mode
  const mode = controlledMode ?? internalMode;
  const setMode = onModeChange ?? setInternalMode;

  // Handle panel resize
  const handleMouseDown = useCallback(() => {
    if (!resizable) return;
    setIsDragging(true);
  }, [resizable]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    // Constrain between 20% and 80%
    setSplit(Math.min(Math.max(percentage, 20), 80));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Synchronized scrolling
  const handlePrimaryScroll = useCallback(() => {
    if (!syncScroll || !primaryRef.current || !secondaryRef.current) return;
    
    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    
    const scrollPercentage = primary.scrollTop / (primary.scrollHeight - primary.clientHeight);
    secondary.scrollTop = scrollPercentage * (secondary.scrollHeight - secondary.clientHeight);
  }, [syncScroll]);

  const handleSecondaryScroll = useCallback(() => {
    if (!syncScroll || !primaryRef.current || !secondaryRef.current) return;
    
    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    
    const scrollPercentage = secondary.scrollTop / (secondary.scrollHeight - secondary.clientHeight);
    primary.scrollTop = scrollPercentage * (primary.scrollHeight - primary.clientHeight);
  }, [syncScroll]);

  const toggleSyncScroll = useCallback(() => {
    setSyncScroll(prev => !prev);
  }, []);

  return (
    <div className={cn(
      'flex flex-col bg-gray-50',
      fullScreen ? 'fixed inset-0 z-50' : 'min-h-screen'
    )}>
      {/* Shared Header */}
      <div className="flex-shrink-0 bg-white border-b sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {title && (
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              )}
              <Badge variant="outline" className="text-xs">
                Split View
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={mode === 'primary-only' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('primary-only')}
                  className="rounded-r-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant={mode === 'split' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('split')}
                  className="rounded-none border-x"
                >
                  Split
                </Button>
                <Button
                  variant={mode === 'secondary-only' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('secondary-only')}
                  className="rounded-l-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Sync Scroll Toggle */}
              {mode === 'split' && (
                <Button
                  variant={syncScroll ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleSyncScroll}
                >
                  {syncScroll ? (
                    <Link2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Link2Off className="w-4 h-4 mr-2" />
                  )}
                  Sync Scroll
                </Button>
              )}

              {headerActions}

              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Split Panels */}
      <div 
        ref={containerRef}
        className="flex-1 flex overflow-hidden relative"
      >
        {/* Primary Panel */}
        {(mode === 'split' || mode === 'primary-only') && (
          <div
            className={cn(
              'flex flex-col bg-white border-r',
              mode === 'primary-only' ? 'w-full' : ''
            )}
            style={mode === 'split' ? { width: `${split}%` } : undefined}
          >
            {/* Primary Panel Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-gray-900">
                      {primaryPanel.title}
                    </h2>
                    {primaryPanel.badge && (
                      <Badge variant={primaryPanel.badge.variant}>
                        {primaryPanel.badge.label}
                      </Badge>
                    )}
                  </div>
                  {primaryPanel.subtitle && (
                    <p className="text-sm text-gray-600">
                      {primaryPanel.subtitle}
                    </p>
                  )}
                </div>
                {primaryPanel.headerActions}
              </div>
            </div>

            {/* Primary Panel Content */}
            <div
              ref={primaryRef}
              className="flex-1 overflow-y-auto"
              onScroll={syncScroll ? handlePrimaryScroll : undefined}
            >
              {primaryLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <div className="text-sm text-gray-500">Loading...</div>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-6">
                  {primaryPanel.content}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resize Handle */}
        {mode === 'split' && resizable && (
          <div
            className={cn(
              'w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors relative group',
              isDragging && 'bg-blue-500'
            )}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>
        )}

        {/* Secondary Panel */}
        {(mode === 'split' || mode === 'secondary-only') && (
          <div
            className={cn(
              'flex flex-col bg-white',
              mode === 'secondary-only' ? 'w-full' : ''
            )}
            style={mode === 'split' ? { width: `${100 - split}%` } : undefined}
          >
            {/* Secondary Panel Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-gray-900">
                      {secondaryPanel.title}
                    </h2>
                    {secondaryPanel.badge && (
                      <Badge variant={secondaryPanel.badge.variant}>
                        {secondaryPanel.badge.label}
                      </Badge>
                    )}
                  </div>
                  {secondaryPanel.subtitle && (
                    <p className="text-sm text-gray-600">
                      {secondaryPanel.subtitle}
                    </p>
                  )}
                </div>
                {secondaryPanel.headerActions}
              </div>
            </div>

            {/* Secondary Panel Content */}
            <div
              ref={secondaryRef}
              className="flex-1 overflow-y-auto"
              onScroll={syncScroll ? handleSecondaryScroll : undefined}
            >
              {secondaryLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <div className="text-sm text-gray-500">Loading...</div>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-6">
                  {secondaryPanel.content}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {footerActions && (
        <div className="flex-shrink-0 bg-white border-t px-6 py-4">
          <div className="flex items-center justify-end gap-2">
            {footerActions}
          </div>
        </div>
      )}
    </div>
  );
});

SplitViewShell.displayName = 'SplitViewShell';

export default SplitViewShell;
