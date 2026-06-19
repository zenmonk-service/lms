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
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Search,
  Upload,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TableSkeleton } from "./skeleton";
import NoDataFound from "../no-data-found";
import { MonthPicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/store";
import { isLeapYear } from "date-fns";

export interface PaginationState {
  page: number;
  limit: number;
  search: string;
}

interface DataTableProps {
  data: any[];
  columns: any[];
  isLoading: boolean;
  isLeaveReport?: boolean;
  setLeaveReportMonth?: (month: string) => void;
  leaveReportMonth?: string;

  searchable?: boolean;
  isExport?: boolean;
  onExport?: () => void;
  onUpload?: (formData: FormData) => void;
  month?: string;
  setMonth?: (date: string) => void;
  totalCount: number;
  pagination?: PaginationState;
  onPaginationChange?: (newPagination: Partial<PaginationState>) => void;
  selectedStatus?: string;
  setSelectedStatus?: (status: string) => void;
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
  isLeaveReport=false,
  setLeaveReportMonth,
  leaveReportMonth,
  searchable = true,
  isExport = false,
  onExport,
  onUpload,
  month,
  setMonth,
  selectedStatus,
  setSelectedStatus,
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
  const {uuid} = useAppSelector((state) => state.organizationsSlice.currentOrganization);
  const [search, setSearch] = useState(searchValue || "");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleSearchDebounced = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (showPagination) {
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("org_uuid", uuid);

   onUpload && onUpload(formData);

    // allow selecting same file again
    event.target.value = "";
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 max-h-[calc(100vh-237px)] overflow-auto flex flex-col justify-between">
        <div className="mb-4 flex items-center justify-between h-15">
          {searchable && (
            <div className="mb-4">
              <InputGroup>
                <InputGroupInput
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    handleSearchDebounced(event.target.value);
                  }}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
            </div>
          )}
          {isExport && (
            <div className="mb-4 flex justify-end gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>

                  <SelectItem value="present">Present</SelectItem>

                  <SelectItem value="absent">Absent</SelectItem>

                  <SelectItem value="late">Late</SelectItem>

                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
              <MonthPicker value={month} onChange={setMonth} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileSpreadsheet className="mr-4 h-4 w-4" />
                    Report Actions
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </DropdownMenuItem>

                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault(); // prevent menu weirdness
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Report
                    </DropdownMenuItem>
                  </>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {isLeaveReport &&   <MonthPicker value={leaveReportMonth} onChange={setLeaveReportMonth} />}
        </div>
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="relative overflow-auto border border-border rounded-sm">
              <Table>
                <TableHeader className="bg-accent sticky top-0 z-10 h-14">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            className="text-xs  font-bold"
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
              <div className="mt-4 flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Rows per page
                  </span>

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
                    -{Math.min(pagination.page * pagination.limit, totalCount)}{" "}
                    of {totalCount}
                  </span>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                  <div className="rounded-md border px-3 py-1 text-sm font-medium">
                    Page {pagination.page}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
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
    </>
  );
}
