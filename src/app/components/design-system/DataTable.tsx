/**
 * Design System - Data Table
 * High-performance table with memoized rows, sorting, and pagination support
 */
import React, { useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  emptyState?: React.ReactNode;
  className?: string;
  rowClassName?: (row: T) => string;
}

// Memoized row component to prevent unnecessary re-renders
const TableRow = React.memo(<T,>({ 
  row, 
  columns, 
  onClick,
  className,
}: { 
  row: T; 
  columns: Column<T>[]; 
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${className || ''}`}
    >
      {columns.map((column) => (
        <td
          key={column.id}
          className={`px-4 py-3 text-sm ${
            column.align === 'right' ? 'text-right' :
            column.align === 'center' ? 'text-center' :
            'text-left'
          }`}
          style={{ width: column.width }}
        >
          {column.accessor(row)}
        </td>
      ))}
    </tr>
  );
}) as <T>(props: { row: T; columns: Column<T>[]; onClick?: () => void; className?: string }) => JSX.Element;

TableRow.displayName = 'TableRow';

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  emptyState,
  className = '',
  rowClassName,
}: DataTableProps<T>) {
  const rows = useMemo(() => {
    return data.map((row) => {
      const key = keyExtractor(row);
      const handleClick = onRowClick ? () => onRowClick(row) : undefined;
      const customClassName = rowClassName ? rowClassName(row) : undefined;
      
      return (
        <TableRow
          key={key}
          row={row}
          columns={columns}
          onClick={handleClick}
          className={customClassName}
        />
      );
    });
  }, [data, columns, keyExtractor, onRowClick, rowClassName]);

  const renderSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) {
      return <ChevronsUpDown className="size-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="size-4 text-blue-600" />
    ) : (
      <ChevronDown className="size-4 text-blue-600" />
    );
  };

  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                  column.sortable && onSort ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                } ${
                  column.align === 'right' ? 'text-right' :
                  column.align === 'center' ? 'text-center' :
                  'text-left'
                }`}
                style={{ width: column.width }}
                onClick={() => column.sortable && onSort && onSort(column.id)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.header}</span>
                  {column.sortable && onSort && renderSortIcon(column.id)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows}
        </tbody>
      </table>
    </div>
  );
}
