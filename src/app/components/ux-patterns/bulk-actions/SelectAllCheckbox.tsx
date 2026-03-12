/**
 * SelectAllCheckbox Component
 * 
 * Checkbox for selecting/deselecting all items.
 * Supports indeterminate state.
 * Part of the Bulk Action Pattern.
 * 
 * @module UXPatterns/BulkActions
 */

import { memo, useEffect, useRef } from 'react';

export interface SelectAllCheckboxProps {
  /** Whether all items are selected */
  checked: boolean;
  
  /** Whether some (but not all) items are selected */
  indeterminate: boolean;
  
  /** Callback when selection changes */
  onChange: (checked: boolean) => void;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Label for accessibility */
  label?: string;
}

/**
 * SelectAllCheckbox - Select all checkbox with indeterminate state
 */
export const SelectAllCheckbox = memo<SelectAllCheckboxProps>(({
  checked,
  indeterminate,
  onChange,
  disabled = false,
  label = 'Select all'
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Set indeterminate state
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="
        w-4 h-4 rounded border-neutral-300 dark:border-neutral-600
        text-primary-600 focus:ring-primary-500 focus:ring-offset-0
        disabled:cursor-not-allowed
      "
      aria-label={label}
    />
  );
});

SelectAllCheckbox.displayName = 'SelectAllCheckbox';
