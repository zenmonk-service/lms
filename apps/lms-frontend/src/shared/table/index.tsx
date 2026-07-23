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
  ColumnDef,
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
import { useEffect, useState } from "react";
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
}

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  maxHeight?: string;
  totalCount: number;
  isLoading: boolean;
  searchable?: boolean;
  searchValue?: string;
  noDataMessage?: string;
  showPagination?: boolean;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  pagination?: PaginationState;
  onSearchChange?: (value: string) => void;
  onPaginationChange?: (newPagination: Partial<PaginationState>) => void;
}

export default function DataTable<TData>({
  data,
  columns,
  children,
  isLoading,
  totalCount,
  pagination,
  searchValue,
  onSearchChange,
  searchable = true,
  onPaginationChange,
  showPagination = true,
  searchPlaceholder = "Search...",
  maxHeight = "calc(100vh - 300px)",
  noDataMessage = "No data available.",
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const [search, setSearch] = useState(searchValue ?? "");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => { setSearch(searchValue ?? "") }, [searchValue]);

  useEffect(() => {
    if (!onSearchChange) return;
    if (debouncedSearch.trim() === (searchValue ?? "").trim()) return;
    
    onSearchChange(debouncedSearch);
  }, [debouncedSearch]);

  const handlePageSizeChange = (newLimit: number) => { onPaginationChange?.({ limit: newLimit, page: 1 }) };
  const handlePageChange = (newPage: number) => { onPaginationChange?.({ page: newPage }) };

  return (
    <div
      className={`
        bg-card flex flex-col justify-between 
        ${searchable && "border border-border rounded-lg p-4"}
        `}
    >
      {searchable ? (
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="w-md">
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
          {children && (
            <div className="flex items-center justify-center gap-2">
              {children}
            </div>
          )}
        </div>
      ) : null}

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <>
          <div
            className="relative border border-border rounded-sm overflow-auto"
            style={{ maxHeight }}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-accent h-10 pointer-events-none">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead className="text-xs font-semibold" key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {!data || data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center p-8">
                      <NoDataFound message={noDataMessage} />
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {showPagination && pagination && onPaginationChange && (
              <div className="mt-3 flex flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Rows per page
                  </p>

                  <Select
                    value={pagination.limit.toString()}
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                  >
                    <SelectTrigger className="w-20" size="sm">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem
                          key={size}
                          value={size.toString()}
                        >
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="rounded-md border px-3 py-1 text-xs font-medium">
                    Page {pagination.page}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page * pagination.limit >= totalCount}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
          )}
        </>
      )}
    </div>
  );
}