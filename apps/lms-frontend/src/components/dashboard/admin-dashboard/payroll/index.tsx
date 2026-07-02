"use client";

import Title from "@/shared/typography/title";
import React, { useState } from "react";
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
import PenaltyRulesGrid from "./penalty-rules-grid";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { generatePayrollAction } from "@/features/payroll/generate-payroll/generate-payroll.action";

const PayrollDashboard = () => {
  const dispatch = useAppDispatch();
  const org_uuid = useAppSelector((state) => state.organizationsSlice.currentOrganization.uuid);

  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const yearOptions = Array.from({ length: 11 }, (_, i) => ({
    value: String(year - 5 + i),
    label: String(year - 5 + i),
  }));

  const { payroll, isLoading, fetchPayrollData } = usePayrollData(
    org_uuid,
    pagination.page,
    pagination.limit,
    search,
    month,
    year,
  );
  const columns = usePayrollColumns();

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
    dispatch(
      generatePayrollAction({
        org_uuid,
        params: { month, year },
      }),
    );
  };

  const handleClick = async () => {
    await generatePayrollData();
    await fetchPayrollData();
  };

  return (
    <>
      <Title
        title={{
          text: "Attendance to Payroll-Cut Ledger",
        }}
        description={{
          text: "Calculate and reconcile unexcused absences, late clock-ins, and negative leave balances directly into Loss of Pay (LOP) Days.",
        }}
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
        searchPlaceholder="Search payroll by employee name..."
        noDataMessage="No payroll data available. Generate payroll to view the payroll-cut ledger."
      >
        <Select value={String(month)} onValueChange={handleMonthChange}>
          <SelectTrigger
            onReset={() => handleMonthChange(String(new Date().getMonth() + 1))}
            value={
              Number(month) === new Date().getMonth() + 1 ? "" : String(month)
            }
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
            value={
              Number(year) === new Date().getFullYear() ? "" : String(year)
            }
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

        <Button
          size="sm"
          onClick={handleClick}
          disabled={isLoading || payroll.rows.length > 0}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Generate Payroll"
          )}
        </Button>
      </DataTable>
    </>
  );
};

export default PayrollDashboard;
