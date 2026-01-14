"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { LoaderCircle, Loader2, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRef, ReactNode } from "react";

export interface PaginationState {
  page: number;
  limit: number;
  search: string;
}

interface DataTableProps {
  data: any[];
  columns: any[];
  isLoading: boolean;
  searchable?: boolean;
  totalCount: number;
  pagination: PaginationState;
  onPaginationChange: (newPagination: Partial<PaginationState>) => void;
  searchPlaceholder?: string;
  noDataMessage?: string;
  title?: string;
  headerActions?: ReactNode;
}

export default function DataTable({
  data,
  columns,
  isLoading,
  searchable = true,
  totalCount,
  pagination,
  onPaginationChange,
  searchPlaceholder = "Search...",
  noDataMessage = "No data available.",
  title,
  headerActions,
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleSearchDebounced = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      handleSearchChange(value);
    }, 500);
  };
  const handleSearchChange = (value: string) => {
    if (value?.trim() === pagination.search) return;
    onPaginationChange({ search: value, page: 1 });
  };

  const handlePageSizeChange = (newLimit: number) => {
    onPaginationChange({ limit: newLimit, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onPaginationChange({ page: newPage });
  };

  const totalPages = Math.ceil(totalCount / pagination.limit);
  const startEntry = totalCount > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endEntry = Math.min(pagination.page * pagination.limit, totalCount);

  return (
    <div className="rounded-2xl border shadow-sm overflow-hidden flex flex-col bg-card h-full">
      {/* Header Section */}
      {(title || headerActions) && (
        <div className="px-8 py-6 border-b border-primary-foreground-100 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4">
            {title && (
              <>
                <h3 className="font-black text-xl tracking-tight text-card-foreground">{title}</h3>
                <span className="text-card-foreground px-2.5 py-0.5 rounded-full text-[11px] font-bold min-w-fit whitespace-nowrap">
                  {totalCount} Total
                </span>
              </>
            )}
          </div>
          {headerActions && (
            <div className="flex flex-wrap items-center gap-3">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Search Section */}
      {searchable && (
        <div className="px-8 py-4 shrink-0">
          <Input
            placeholder={searchPlaceholder}
            onChange={(event) => handleSearchDebounced(event.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table Section */}
      <div className="flex-1 overflow-hidden px-4 pb-4 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-card-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => (
                  <th 
                    key={header.id}
                    className="px-6 py-4 text-[11px] uppercase tracking-widest"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center">
                  <div className="flex justify-center items-center w-full">
                    <Loader2 className="animate-spin text-slate-400" size={24} />
                  </div>
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                      <Calendar size={32} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="text-lg font-black mb-1">No Records Found</p>
                      <p className="text-sm text-secondary-foreground/80">{noDataMessage}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="group transition-all duration-200">
                  {row.getVisibleCells().map((cell, index) => {
                    const isFirst = index === 0;
                    const isLast = index === row.getVisibleCells().length - 1;
                    return (
                      <td 
                        key={cell.id}
                        className={`px-6 py-5 border-y border-primary-foreground-100 group-hover:border-secondary-foreground transition-colors group-hover:bg-secondary ${
                          isFirst ? 'border-l rounded-l-xl' : ''
                        } ${
                          isLast ? 'border-r rounded-r-xl' : ''
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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

      {/* Pagination Section */}
      {totalPages >= 1 && (
        <div className="flex items-center justify-between px-8 py-4 border-t shrink-0">
          <div className="text-sm text-card-foreground">
            Showing <span className="font-bold text-card-foreground">{startEntry}</span> to{' '}
            <span className="font-bold text-card-foreground">{endEntry}</span> of{' '}
            <span className="font-bold text-card-foreground">{totalCount}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm font-bold text-card-foreground border rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-all ${
                    pagination.page === pageNum
                      ? 'bg-primary text-white shadow-lg shadow-primary-200'
                      : 'text-card-foreground border hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="px-3 py-1.5 text-sm font-bold text-card-foreground border rounded-lg hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
