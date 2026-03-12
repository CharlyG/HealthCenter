/**
 * CompactTable Component
 * High-density table for dashboard widgets and space-constrained views
 * Smaller text, tighter spacing, optimized for scanning large datasets
 */

import { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export interface CompactColumn<T> {
  key: string;
  header: string;
  render: (item: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface CompactTableProps<T> {
  data: T[];
  columns: CompactColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T, index: number) => void;
  emptyMessage?: string;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}

export function CompactTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data',
  loading = false,
  striped = false,
  hoverable = true,
}: CompactTableProps<T>) {
  if (loading) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        <div className="inline-block size-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <div className="mt-2">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`
                  text-xs font-medium text-gray-700 py-2 px-3
                  ${column.align === 'right' ? 'text-right' : ''}
                  ${column.align === 'center' ? 'text-center' : ''}
                `}
                style={{ width: column.width }}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={keyExtractor(item, index)}
              className={`
                border-b border-gray-100
                ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
                ${hoverable ? 'hover:bg-gray-50' : ''}
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => onRowClick?.(item, index)}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={`
                    text-xs py-2 px-3
                    ${column.align === 'right' ? 'text-right' : ''}
                    ${column.align === 'center' ? 'text-center' : ''}
                  `}
                >
                  {column.render(item, index)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
