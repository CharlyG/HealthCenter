/**
 * useBulkSelection Hook
 * 
 * Hook for managing bulk selection state and operations.
 * Part of the Bulk Action Pattern.
 * 
 * @module UXPatterns/BulkActions
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseBulkSelectionOptions<T = any> {
  /** Unique identifier key for items */
  idKey?: keyof T;
  
  /** Initial selected items */
  initialSelection?: string[];
}

export interface UseBulkSelectionReturn {
  /** Set of selected item IDs */
  selectedIds: Set<string>;
  
  /** Array of selected item IDs */
  selectedArray: string[];
  
  /** Number of selected items */
  selectedCount: number;
  
  /** Check if an item is selected */
  isSelected: (id: string) => boolean;
  
  /** Toggle selection for a single item */
  toggleSelection: (id: string) => void;
  
  /** Select a single item */
  selectItem: (id: string) => void;
  
  /** Deselect a single item */
  deselectItem: (id: string) => void;
  
  /** Select all items */
  selectAll: (ids: string[]) => void;
  
  /** Deselect all items */
  deselectAll: () => void;
  
  /** Toggle select all */
  toggleSelectAll: (ids: string[]) => void;
  
  /** Check if all items are selected */
  isAllSelected: (totalIds: string[]) => boolean;
  
  /** Check if some (but not all) items are selected */
  isIndeterminate: (totalIds: string[]) => boolean;
}

/**
 * useBulkSelection - Manage bulk selection state
 */
export function useBulkSelection<T = any>({
  idKey = 'id' as keyof T,
  initialSelection = []
}: UseBulkSelectionOptions<T> = {}): UseBulkSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelection)
  );

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);
  const selectedCount = selectedIds.size;

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectItem = useCallback((id: string) => {
    setSelectedIds(prev => new Set(prev).add(id));
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      if (prev.size === ids.length) {
        return new Set();
      }
      return new Set(ids);
    });
  }, []);

  const isAllSelected = useCallback((totalIds: string[]) => {
    if (totalIds.length === 0) return false;
    return totalIds.every(id => selectedIds.has(id));
  }, [selectedIds]);

  const isIndeterminate = useCallback((totalIds: string[]) => {
    const selectedInList = totalIds.filter(id => selectedIds.has(id)).length;
    return selectedInList > 0 && selectedInList < totalIds.length;
  }, [selectedIds]);

  return {
    selectedIds,
    selectedArray,
    selectedCount,
    isSelected,
    toggleSelection,
    selectItem,
    deselectItem,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isAllSelected,
    isIndeterminate
  };
}
