/**
 * useGlobalSearch Hook
 * 
 * Hook for managing global search state and keyboard shortcuts.
 * Part of the Global Search Pattern.
 * 
 * @module UXPatterns/Search
 */

import { useState, useEffect, useCallback } from 'react';
import type { SearchResult } from './GlobalSearch';

export interface UseGlobalSearchOptions {
  /** Search function */
  onSearch: (query: string) => Promise<SearchResult[]>;
  
  /** Keyboard shortcut (default: 'k') */
  shortcutKey?: string;
  
  /** Require Ctrl/Cmd modifier (default: true) */
  requireModifier?: boolean;
}

export interface UseGlobalSearchReturn {
  /** Whether search is open */
  isOpen: boolean;
  
  /** Open search */
  open: () => void;
  
  /** Close search */
  close: () => void;
  
  /** Toggle search */
  toggle: () => void;
  
  /** Search function */
  search: (query: string) => Promise<SearchResult[]>;
}

/**
 * useGlobalSearch - Global search state management
 */
export function useGlobalSearch({
  onSearch,
  shortcutKey = 'k',
  requireModifier = true
}: UseGlobalSearchOptions): UseGlobalSearchReturn {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifierPressed = e.ctrlKey || e.metaKey;
      
      if (requireModifier && isModifierPressed && e.key.toLowerCase() === shortcutKey) {
        e.preventDefault();
        toggle();
      } else if (!requireModifier && e.key.toLowerCase() === shortcutKey) {
        // Only trigger if not typing in an input
        const target = e.target as HTMLElement;
        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
          e.preventDefault();
          toggle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutKey, requireModifier, toggle]);

  return {
    isOpen,
    open,
    close,
    toggle,
    search: onSearch
  };
}
