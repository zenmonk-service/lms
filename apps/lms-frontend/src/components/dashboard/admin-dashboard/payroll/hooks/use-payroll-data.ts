"use client";

import { listPayrollAction } from "@/features/payroll/list-payroll/list-payroll.action";
import { useAppDispatch, useAppSelector } from "@/store";
import { useEffect, useState } from "react";

export function usePayrollData(
  org_uuid: string,
  page: number,
  limit: number,
  search: string,
  month: number,
  year: number,
) {
  const dispatch = useAppDispatch();
  const payroll = useAppSelector((state) => state.payrollSlice.payroll);

  const [isLoading, setIsLoading] = useState(false);

  const fetchPayrollData = async () => {
    if (!org_uuid) return;
    setIsLoading(true);
    dispatch(
      listPayrollAction({ org_uuid, params: { page, limit, search, month, year } }),
    ).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchPayrollData();
  }, [org_uuid, page, limit, search, month, year, dispatch]);

  return { isLoading, payroll, fetchPayrollData };
}
