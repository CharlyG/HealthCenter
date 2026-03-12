/**
 * StickyActionFooter Component
 * Fixed footer for form actions that stays visible during scroll
 * Includes autosave status and primary/secondary actions
 */

import { ReactNode } from 'react';
import { Button } from '../ui/button';
import { Loader2, Save, Check } from 'lucide-react';

export interface StickyActionFooterProps {
  /** Primary action button */
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  /** Autosave status */
  autosaveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  /** Custom content (left side) */
  leftContent?: ReactNode;
  /** Custom content (right side) */
  rightContent?: ReactNode;
  /** Show border */
  border?: boolean;
}

export function StickyActionFooter({
  primaryAction,
  secondaryAction,
  autosaveStatus,
  leftContent,
  rightContent,
  border = true,
}: StickyActionFooterProps) {
  return (
    <div
      className={`sticky bottom-0 left-0 right-0 bg-white z-10 ${
        border ? 'border-t border-gray-200' : ''
      }`}
    >
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* Left content or autosave status */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          {leftContent}
          {!leftContent && autosaveStatus && (
            <>
              {autosaveStatus === 'saving' && (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-blue-600" />
                  <span>Saving draft...</span>
                </div>
              )}
              {autosaveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="size-4" />
                  <span>Draft saved</span>
                </div>
              )}
              {autosaveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <span>Failed to save draft</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right content or action buttons */}
        <div className="flex items-center gap-3">
          {rightContent ? (
            rightContent
          ) : (
            <>
              {secondaryAction && (
                <Button
                  variant="outline"
                  onClick={secondaryAction.onClick}
                  disabled={secondaryAction.disabled}
                >
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  disabled={primaryAction.disabled || primaryAction.loading}
                >
                  {primaryAction.loading && (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  )}
                  {!primaryAction.loading && <Save className="size-4 mr-2" />}
                  {primaryAction.label}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
