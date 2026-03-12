/**
 * useKeyboardShortcut Hook
 * 
 * Hook for registering keyboard shortcuts.
 * Part of the Keyboard Shortcuts Pattern.
 * 
 * @module UXPatterns/KeyboardShortcuts
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutConfig {
  /** Key to listen for */
  key: string;
  
  /** Callback when shortcut is triggered */
  callback: (event: KeyboardEvent) => void;
  
  /** Require Ctrl/Cmd modifier */
  ctrl?: boolean;
  
  /** Require Shift modifier */
  shift?: boolean;
  
  /** Require Alt/Option modifier */
  alt?: boolean;
  
  /** Prevent default behavior */
  preventDefault?: boolean;
  
  /** Only trigger when not in input fields */
  excludeInputs?: boolean;
  
  /** Description for help/documentation */
  description?: string;
}

/**
 * useKeyboardShortcut - Register keyboard shortcut
 */
export function useKeyboardShortcut({
  key,
  callback,
  ctrl = false,
  shift = false,
  alt = false,
  preventDefault = true,
  excludeInputs = true
}: KeyboardShortcutConfig): void {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if in input field
    if (excludeInputs) {
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }
    }

    // Check modifiers
    const ctrlPressed = event.ctrlKey || event.metaKey;
    const shiftPressed = event.shiftKey;
    const altPressed = event.altKey;

    if (
      event.key.toLowerCase() === key.toLowerCase() &&
      ctrlPressed === ctrl &&
      shiftPressed === shift &&
      altPressed === alt
    ) {
      if (preventDefault) {
        event.preventDefault();
      }
      callback(event);
    }
  }, [key, callback, ctrl, shift, alt, preventDefault, excludeInputs]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * useKeyboardShortcuts - Register multiple keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcutConfig[]): void {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    for (const shortcut of shortcuts) {
      // Check if in input field
      if (shortcut.excludeInputs !== false) {
        const target = event.target as HTMLElement;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
          continue;
        }
      }

      // Check modifiers
      const ctrlPressed = event.ctrlKey || event.metaKey;
      const shiftPressed = event.shiftKey;
      const altPressed = event.altKey;

      if (
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        ctrlPressed === (shortcut.ctrl || false) &&
        shiftPressed === (shortcut.shift || false) &&
        altPressed === (shortcut.alt || false)
      ) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.callback(event);
        break; // Only trigger first match
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
