"use client";

import { listPayrollAction } from "@/features/payroll/list-payroll/list-payroll.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";

export function usePayrollData(
  page: number,
  limit: number,
  search: string,
  month: number,
  year: number,
) {
  const dispatch = useAppDispatch();
  const org_uuid = useAppSelector((state) => state.organizationsSlice.currentOrganization.uuid);
  const { payroll, isLoading } = useAppSelector((state) => state.payrollSlice);

  const fetchPayrollData = async (params: {
    page: number;
    limit: number;
    search?: string;
    month: number;
    year: number;
  }) => {
    if (!org_uuid) return;
    const {month, year, ...rest} = params;
    const period = `${year}-${String(month).padStart(2, "0")}`;
    await dispatch(
      listPayrollAction({
        org_uuid,
        params: { ...rest, period },
      }),
    );
  };

  useEffect(() => {
    fetchPayrollData({ page, limit, search, month, year });
  }, [org_uuid, page, limit, search, month, year, dispatch]);

  return { isLoading, payroll, fetchPayrollData };
}
