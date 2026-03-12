/**
 * ExpandableFieldset Component
 * 
 * Fieldset with show more/less functionality for advanced options.
 * Part of the Progressive Disclosure Pattern.
 * 
 * @module UXPatterns/ProgressiveDisclosure
 */

import { memo, ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface ExpandableFieldsetProps {
  /** Basic fields (always visible) */
  basicFields: ReactNode;
  
  /** Advanced fields (hidden by default) */
  advancedFields: ReactNode;
  
  /** Label for expand button */
  expandLabel?: string;
  
  /** Label for collapse button */
  collapseLabel?: string;
  
  /** Initially expanded */
  defaultExpanded?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * ExpandableFieldset - Fieldset with basic/advanced sections
 */
export const ExpandableFieldset = memo<ExpandableFieldsetProps>(({
  basicFields,
  advancedFields,
  expandLabel = 'Show advanced options',
  collapseLabel = 'Hide advanced options',
  defaultExpanded = false,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Basic fields */}
      {basicFields}

      {/* Expand/Collapse button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="
          flex items-center gap-2 text-sm font-medium
          text-primary-600 dark:text-primary-400
          hover:text-primary-700 dark:hover:text-primary-300
          transition-colors
        "
      >
        {expanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            <span>{collapseLabel}</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>{expandLabel}</span>
          </>
        )}
      </button>

      {/* Advanced fields */}
      {expanded && (
        <div className="space-y-4 pt-2 border-t border-neutral-200 dark:border-neutral-700">
          {advancedFields}
        </div>
      )}
    </div>
  );
});

ExpandableFieldset.displayName = 'ExpandableFieldset';
