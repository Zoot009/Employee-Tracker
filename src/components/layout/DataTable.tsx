// src/components/layout/DataTable.tsx
'use client';

import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onSort,
  sortKey,
  sortDirection,
  loading = false,
  emptyMessage = "No data available"
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  const getNestedValue = (obj: T, path: string) => {
    return path.split('.').reduce((value, key) => value?.[key], obj);
  };

  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-4 text-left font-medium ${
                    column.align === 'center' ? 'text-center' :
                    column.align === 'right' ? 'text-right' : ''
                  }`}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(String(column.key))}
                      className="h-auto p-0 font-medium flex items-center space-x-1"
                    >
                      <span>{column.title}</span>
                      {getSortIcon(String(column.key))}
                    </Button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-muted/25">
                  {columns.map((column) => {
                    const value = getNestedValue(item, String(column.key));
                    const content = column.render ? column.render(value, item) : String(value ?? '');
                    
                    return (
                      <td
                        key={String(column.key)}
                        className={`px-6 py-4 ${
                          column.align === 'center' ? 'text-center' :
                          column.align === 'right' ? 'text-right' : ''
                        }`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}