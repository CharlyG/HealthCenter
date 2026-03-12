/**
 * SelectableRow Component
 * 
 * Table row with selection checkbox.
 * Part of the Bulk Action Pattern.
 * 
 * @module UXPatterns/BulkActions
 */

import { memo, ReactNode } from 'react';

export interface SelectableRowProps {
  /** Unique identifier for the row */
  id: string;
  
  /** Whether the row is selected */
  selected: boolean;
  
  /** Callback when selection changes */
  onSelectionChange: (id: string, selected: boolean) => void;
  
  /** Row content */
  children: ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Disabled state */
  disabled?: boolean;
}

/**
 * SelectableRow - Table row with selection checkbox
 */
export const SelectableRow = memo<SelectableRowProps>(({
  id,
  selected,
  onSelectionChange,
  children,
  className = '',
  disabled = false
}) => {
  return (
    <tr
      className={`
        ${selected ? 'bg-primary-50 dark:bg-primary-900/10' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}
        transition-colors
        ${className}
      `}
    >
      <td className="w-12 px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelectionChange(id, e.target.checked)}
          disabled={disabled}
          className="
            w-4 h-4 rounded border-neutral-300 dark:border-neutral-600
            text-primary-600 focus:ring-primary-500 focus:ring-offset-0
            disabled:cursor-not-allowed
          "
          aria-label="Select row"
        />
      </td>
      {children}
    </tr>
  );
});

SelectableRow.displayName = 'SelectableRow';
