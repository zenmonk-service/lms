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
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TableSkeleton } from "./skeleton";
import NoDataFound from "../no-data-found";

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
  pagination?: PaginationState;
  onPaginationChange?: (newPagination: Partial<PaginationState>) => void;
  showPagination?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  noDataMessage?: string;
}

export default function DataTable({
  data,
  columns,
  isLoading,
  searchable = true,
  totalCount,
  pagination,
  onPaginationChange,
  showPagination = true,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  noDataMessage = "No data available.",
}: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleSearchDebounced = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if(showPagination) {
      searchTimeout.current = setTimeout(() => {
        handleSearchChange(value);
      }, 500);
    } else {
      handleSearchChange(value);
    }
  };

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

  return (
    <>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-card border border-border rounded-lg p-4 max-h-[calc(100vh-237px)] overflow-auto flex flex-col justify-between">
        {searchable && (
          <div className="mb-4 ">
            <InputGroup>
              <InputGroupInput
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => handleSearchDebounced(event.target.value)}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
          </div>
        )}
          <div className="relative overflow-auto border border-border rounded-sm">
            <Table>
              <TableHeader className="bg-accent sticky top-0 z-10 h-14">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          className="text-xs uppercase font-bold"
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
            <div className="flex items-center justify-end space-x-2 pt-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Select Page Size:</span>
                <Select
                  onValueChange={(val) => handlePageSizeChange(Number(val))}
                  value={pagination.limit.toString()}
                >
                  <SelectTrigger className="w-17.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs">Page Size</SelectLabel>
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.limit >= totalCount}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
