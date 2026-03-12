/**
 * TableSkeleton Component
 * 
 * Skeleton loading state for tables.
 * Part of the Loading States Pattern.
 * 
 * @module UXPatterns/Loading
 */

import { memo } from 'react';
import { SkeletonLoader } from './SkeletonLoader';

export interface TableSkeletonProps {
  /** Number of rows to display */
  rows?: number;
  
  /** Number of columns to display */
  columns?: number;
  
  /** Show header row */
  showHeader?: boolean;
  
  /** Column widths (optional) */
  columnWidths?: string[];
}

/**
 * TableSkeleton - Loading state for tables
 */
export const TableSkeleton = memo<TableSkeletonProps>(({
  rows = 5,
  columns = 4,
  showHeader = true,
  columnWidths
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table className="w-full">
        {showHeader && (
          <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
            <tr>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <th
                  key={colIndex}
                  className="px-4 py-3 text-left"
                  style={columnWidths?.[colIndex] ? { width: columnWidths[colIndex] } : undefined}
                >
                  <SkeletonLoader variant="text" width="60%" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-3"
                  style={columnWidths?.[colIndex] ? { width: columnWidths[colIndex] } : undefined}
                >
                  <SkeletonLoader 
                    variant="text" 
                    width={colIndex === 0 ? '80%' : '70%'} 
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

TableSkeleton.displayName = 'TableSkeleton';
