/**
 * Global Search Trigger
 * Renders a compact search bar in the top navigation that opens
 * the global Command Palette (Cmd+K) when clicked or focused.
 *
 * This component does NOT handle search itself — the CommandPalette
 * component handles all search logic, live API calls, and navigation.
 */
import React, { useCallback } from 'react';
import { Search, Command } from 'lucide-react';

export function GlobalSearch() {
  const openCommandPalette = useCallback(() => {
    // Dispatch the same keyboard event the CommandPalette listens for
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      })
    );
  }, []);

  return (
    <button
      onClick={openCommandPalette}
      className="flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-colors text-sm text-gray-500 w-64 group"
      aria-label="Open command palette"
    >
      <Search className="size-4 text-gray-400 group-hover:text-gray-500" />
      <span className="flex-1 text-left text-gray-400 group-hover:text-gray-500">
        Search or jump to...
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 h-5 rounded border border-gray-200 bg-white text-[10px] font-mono text-gray-400">
        <Command className="size-3" />K
      </kbd>
    </button>
  );
}
