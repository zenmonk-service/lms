"use client";

import Title from "@/shared/typography/title";
import React, { useMemo, useState } from "react";
import { usePayrollData } from "./hooks/use-payroll-data";
import { useAppDispatch, useAppSelector } from "@/store";
import { usePayrollColumns } from "./hooks/use-payroll-column-def";
import DataTable from "@/shared/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { months } from "@/utils/data";
import { Button } from "@/components/ui/button";
import { ChevronDown, Download, Layers, LoaderCircle } from "lucide-react";
import { generatePayrollAction } from "@/features/payroll/generate-payroll/generate-payroll.action";
import { listMissingAttendancesAction } from "@/features/attendances/list-missing-attendances/list-missing-attendances.action";
import { ProvideSlaModal } from "../../shared/sla-modal";
import PenaltyRulesGrid from "./components/penalty-rules-grid";
import AttendanceReconciliation from "./components/attendance-reconciliation";
import { ResolveTypeSelector } from "./components/reslove-type-selector";
import { AttendanceResolveModal } from "./components/attendance-resolve-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadPayrollAction } from "@/features/payroll/download-payroll/download-payroll.action";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";

const PayrollDashboard = () => {
  const dispatch = useAppDispatch();
  const { isDownloading } = useAppSelector((state) => state.payrollSlice);
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );

  const can = usePermissionCheck();
  const canReadPayroll = can(
    PermissionTag.PAYROLL_MANAGEMENT,
    PermissionAction.READ,
  );
  const canGeneratePayroll = can(
    PermissionTag.PAYROLL_MANAGEMENT,
    PermissionAction.CREATE,
  );
  const canGenerateReport = can(
    PermissionTag.PAYROLL_MANAGEMENT,
    PermissionAction.REPORT,
  );

  const [openDropdown, setOpenDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [slaModalOpen, setSlaModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [resolveTypeSelectorOpen, setResolveTypeSelectorOpen] = useState(false);
  const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);
  const [reconciliationDialogOpen, setReconciliationDialogOpen] = useState(false);
  const [attendanceResolveModalOpen, setAttendanceResolveModalOpen] = useState(false);

  const dateRange = useMemo(() => {
    const lastDay = new Date(year, month, 0).getDate();

    return {
      start_date: `${year}-${String(month).padStart(2, "0")}-01`,
      end_date: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
    };
  }, [year, month]);

  const yearOptions = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => ({
      value: String(year - 5 + i),
      label: String(year - 5 + i),
    }));
  }, [year]);

  const { payroll, isLoading, fetchPayrollData } = usePayrollData(
    pagination.page,
    pagination.limit,
    search,
    month,
    year,
  );

  const handleResolveSelectorClick = (
    type: "attendance_penalty" | "leave_balance_deficit",
  ) => {
    if (type === "attendance_penalty") setAttendanceResolveModalOpen(true);
    else if (type === "leave_balance_deficit") setSlaModalOpen(true);
  };

  const handleResolveClick = (
    payroll_id: string,
    user_uuid: string,
    penalty: "attendance_penalty" | "leave_balance_deficit" | "both" | null,
  ) => {
    if (penalty === "both") setResolveTypeSelectorOpen(true);
    else if (penalty === "leave_balance_deficit") setSlaModalOpen(true);
    else if (penalty === "attendance_penalty") setAttendanceResolveModalOpen(true);
    setSelectedPayrollId(payroll_id);
    setSelectedUserUuid(user_uuid);
  };

  const columns = usePayrollColumns(handleResolveClick);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePaginationChange = (newPagination: {
    page?: number;
    limit?: number;
  }) => {
    setPagination((prev) => ({ ...prev, ...newPagination }));
  };

  const handleMonthChange = (value: string) => {
    setMonth(Number(value));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleYearChange = (value: string) => {
    setYear(Number(value));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const generatePayrollData = async () => {
    if (!org_uuid) return;
    await dispatch(
      generatePayrollAction({
        org_uuid,
        params: { period: `${year}-${String(month).padStart(2, "0")}` },
      }),
    );
  };

  const handleClick = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.preventDefault();

    setIsGenerating(true);
    const period = `${year}-${String(month).padStart(2, "0")}`;
    const res = await dispatch(listMissingAttendancesAction({ org_uuid, params: { period } }));
    if (res.payload && res.payload.length > 0) {
      setReconciliationDialogOpen(true);
      setIsGenerating(false);
      setOpenDropdown(false);
      return;
    }
    await generatePayrollData();
    await fetchPayrollData({ page: 1, limit: 10, month, year });
    setIsGenerating(false);
    setOpenDropdown(false);
  };

  const handlePayrollDownload = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.preventDefault();

    const period = `${String(month).padStart(2, "0")}-${year}`;
    await dispatch(downloadPayrollAction({ org_uuid, period }));

    setOpenDropdown(false);
  };

  return (
    <>
      <Title
        title={{ text: "Attendance to Payroll-Cut Ledger" }}
        description={{ text: "Calculate and reconcile unexcused absences, late clock-ins, and negative leave balances directly into Loss of Pay (LOP) Days." }}
      />

      <PenaltyRulesGrid />

      <DataTable
        columns={columns}
        data={payroll.rows}
        isLoading={isLoading}
        showPagination={true}
        pagination={pagination}
        totalCount={payroll.count}
        searchValue={search}
        onSearchChange={handleSearchChange}
        onPaginationChange={handlePaginationChange}
        hasPermission={canReadPayroll}
        moduleName="Payroll"
        searchPlaceholder="Search by employee name"
        noDataMessage="No payroll data available. Generate payroll to view the payroll-cut ledger."
      >
        <Select value={String(month)} onValueChange={handleMonthChange}>
          <SelectTrigger
            onReset={() => handleMonthChange(String(new Date().getMonth() + 1))}
            value={Number(month) === new Date().getMonth() + 1 ? "" : String(month)}
          >
            <SelectValue placeholder="Select month..." />
          </SelectTrigger>
          <SelectContent>
            {months.map((monthOption) => (
              <SelectItem key={monthOption.value} value={monthOption.value}>
                {monthOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(year)} onValueChange={handleYearChange}>
          <SelectTrigger
            onReset={() => handleYearChange(String(new Date().getFullYear()))}
            value={Number(year) === new Date().getFullYear() ? "" : String(year)}
          >
            <SelectValue placeholder="Select year..." />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((yearOption) => (
              <SelectItem key={yearOption.value} value={yearOption.value}>
                {yearOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(canGeneratePayroll || canGenerateReport) && (
          <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
            <DropdownMenuTrigger asChild className="flex-1">
              <Button variant="outline" className="group">
                Actions
                <ChevronDown className="w-3.5 h-3.5 ml-auto text-muted-foreground group-data-[state=open]:rotate-180 transition-transform" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {canGeneratePayroll && (
                <DropdownMenuItem onClick={handleClick} disabled={isGenerating}>
                  {isGenerating ? <LoaderCircle className="animate-spin mr-2 w-4 h-4" /> : <Layers className="w-4 h-4 mr-2" />}
                  Generate Payroll
                </DropdownMenuItem>
              )}
              {canGenerateReport && (
                <DropdownMenuItem
                  onClick={handlePayrollDownload}
                  disabled={payroll.rows.length === 0 || isDownloading}
                >
                  {isDownloading ? <LoaderCircle className="animate-spin mr-2 w-4 h-4" /> : <Download className="w-4 h-4 mr-2" />}
                  Download Excel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </DataTable>

      <AttendanceReconciliation
        open={reconciliationDialogOpen}
        onOpenChange={setReconciliationDialogOpen}
      />

      <ProvideSlaModal
        open={slaModalOpen}
        onResolve={generatePayrollData}
        selectedUserUuid={selectedUserUuid!}
        onOpenChange={() => setSlaModalOpen(false)}
        period={`${year}-${String(month).padStart(2, "0")}`}
      />

      <ResolveTypeSelector
        open={resolveTypeSelectorOpen}
        handleOpen={handleResolveSelectorClick}
        onOpenChange={setResolveTypeSelectorOpen}
      />

      <AttendanceResolveModal
        dateRange={dateRange}
        open={attendanceResolveModalOpen}
        selectedUserUuid={selectedUserUuid!}
        onOpenChange={setAttendanceResolveModalOpen}
        onClose={async () =>
          await fetchPayrollData({
            page: pagination.page,
            limit: pagination.limit,
            month,
            year,
          })
        }
      />
    </>
  );
};

export default PayrollDashboard;
