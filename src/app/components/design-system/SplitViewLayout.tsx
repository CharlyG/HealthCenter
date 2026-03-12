/**
 * Healthcare Design System - Split View Layout
 * Two-column layout with primary content and inspector drawer
 */
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface SplitViewLayoutProps {
  children: React.ReactNode;
  inspector?: React.ReactNode;
  inspectorTitle?: string;
  inspectorOpen?: boolean;
  onInspectorClose?: () => void;
  inspectorWidth?: 'sm' | 'md' | 'lg';
  className?: string;
}

const inspectorWidths = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[480px]',
};

export const SplitViewLayout = ({
  children,
  inspector,
  inspectorTitle,
  inspectorOpen: controlledOpen,
  onInspectorClose,
  inspectorWidth = 'md',
  className = '',
}: SplitViewLayoutProps) => {
  const [internalOpen, setInternalOpen] = useState(true);
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleClose = () => {
    if (onInspectorClose) {
      onInspectorClose();
    } else {
      setInternalOpen(false);
    }
  };

  const handleToggle = () => {
    if (controlledOpen !== undefined && onInspectorClose) {
      onInspectorClose();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <div className={`flex h-full overflow-hidden ${className}`}>
      {/* Primary Content */}
      <div className={`flex-1 overflow-auto transition-all ${isOpen && inspector ? 'mr-0' : ''}`}>
        {children}
      </div>

      {/* Inspector Drawer */}
      {inspector && (
        <>
          {/* Toggle Button (when closed) */}
          {!isOpen && (
            <button
              onClick={handleToggle}
              className="fixed right-0 top-1/2 -translate-y-1/2 bg-white border-l border-t border-b border-gray-200 rounded-l-md p-2 shadow-md hover:bg-gray-50 z-40"
              aria-label="Open inspector"
            >
              <ChevronLeft className="size-5 text-gray-600" />
            </button>
          )}

          {/* Inspector Panel */}
          <div
            className={`${inspectorWidths[inspectorWidth]} border-l border-gray-200 bg-white overflow-auto transition-transform duration-300 ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            } fixed right-0 top-0 h-full z-40`}
          >
            {/* Inspector Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                {inspectorTitle || 'Details'}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggle}
                  aria-label="Toggle inspector"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  aria-label="Close inspector"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Inspector Content */}
            <div className="p-6">
              {inspector}
            </div>
          </div>

          {/* Overlay (mobile) */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-30 lg:hidden"
              onClick={handleClose}
            />
          )}
        </>
      )}
    </div>
  );
};