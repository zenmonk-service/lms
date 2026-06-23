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
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TableSkeleton } from "./skeleton";
import NoDataFound from "../no-data-found";
import { useDebounce } from "../hooks/use-debounce";
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
  isExport?: boolean;
  onExport?: () => void;
  totalCount: number;
  pagination?: PaginationState;
  onPaginationChange?: (newPagination: Partial<PaginationState>) => void;
  showPagination?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  noDataMessage?: string;
  maxHeight?: string;
}

export default function DataTable({
  data,
  columns,
  isLoading,
  searchable = true,
  isExport = false,
  onExport,
  totalCount,
  pagination,
  onPaginationChange,
  showPagination = true,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  noDataMessage = "No data available.",
  maxHeight = "calc(100vh - 300px)",
}: DataTableProps) {
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  const [search, setSearch] = useState(searchValue || "");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => { handleSearchChange(debouncedSearch) }, [debouncedSearch]);

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      if (value?.trim() === searchValue?.trim()) return;
      onSearchChange(value);
      return;
    }
    if (!pagination || !onPaginationChange) return;
    if (value?.trim() === pagination.search) return;
    onPaginationChange({ search: value, page: 1 });
  };

  const handlePageSizeChange = (newLimit: number) => {
    if (!onPaginationChange) return;
    onPaginationChange({ limit: newLimit, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (!onPaginationChange) return;
    onPaginationChange({ page: newPage });
  };

  const renderColGroup = () => (
    <colgroup>
      {table.getVisibleLeafColumns().map((column) => (
        <col
          key={column.id}
          style={{
            width: `${column.getSize()}px`,
          }}
        />
      ))}
    </colgroup>
  );

  return (
    <div
      className={`
        bg-card flex flex-col justify-between 
        ${(searchable || isExport) && "border border-border rounded-lg p-4"}
        `}
    >

      {searchable || isExport ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          {searchable && (
            <div className="w-full">
              <InputGroup>
                <InputGroupInput
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
          )}
          
          {isExport && (
            <div className="flex justify-end">
              <Button variant="outline" size="default" onClick={onExport}>
                Download Report
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <div className="relative border border-border rounded-sm overflow-auto" style={{ maxHeight }}>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-accent h-10 pointer-events-none">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            className="text-xs font-semibold"
                            key={header.id}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {!data || data.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center p-8"
                      >
                        <NoDataFound message={noDataMessage} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
          </div>

          {showPagination && pagination && onPaginationChange && (
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Rows per page</span>
    
                <Select
                  value={pagination.limit.toString()}
                  onValueChange={(val) => handlePageSizeChange(Number(val))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
    
                  <SelectContent>
                    {[5, 10, 20, 50].map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
    
                <span className="text-sm text-muted-foreground">
                  {Math.min(
                    (pagination.page - 1) * pagination.limit + 1,
                    totalCount,
                  )}
                  -{Math.min(pagination.page * pagination.limit, totalCount)} of{" "}
                  {totalCount}
                </span>
              </div>
    
              <div className="flex items-center gap-2">
                <div className="rounded-md border px-3 py-1 text-sm font-medium">
                  Page {pagination.page}
                </div>
    
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
    
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.limit >= totalCount}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
