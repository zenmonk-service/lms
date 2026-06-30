"use client";

import { generatePayrollAction } from "@/features/payroll/generate-payroll/generate-payroll.action";
import { listPayrollAction } from "@/features/payroll/list-payroll/list-payroll.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect } from "react";

export function usePayrollData(
  org_uuid: string,
  page: number,
  limit: number,
  search: string,
  month: number,
  year: number,
) {
  const dispatch = useAppDispatch();
  const { payroll, isLoading } = useAppSelector((state) => state.payrollSlice);

  const fetchPayrollData = async () => {
    if (!org_uuid) return;
    dispatch(
      listPayrollAction({
        org_uuid,
        params: { page, limit, search, month, year },
      }),
    );
  };

  useEffect(() => {
    fetchPayrollData();
  }, [org_uuid, page, limit, search, month, year, dispatch]);

  return { isLoading, payroll, fetchPayrollData };
}
