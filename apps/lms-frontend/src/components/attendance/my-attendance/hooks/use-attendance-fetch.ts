import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getUserAttendancesAction } from "@/features/attendances/get-user-attendances/get-user-attendances.action";
import { AttendanceStatus } from "@/features/attendances/attendances.type";

interface Params {
  dateRange: { start_date?: string; end_date?: string };
  currentPage: number;
  itemsPerPage: number;
  userUUID: string;
  status?: AttendanceStatus;
  enabled?: boolean;
}

export function useAttendanceFetch({
  dateRange,
  currentPage,
  itemsPerPage,
  userUUID,
  status,
  enabled = true,
}: Params) {
  const dispatch = useAppDispatch();

  const orgUUID = useAppSelector(
    (s) => s.organizationsSlice.currentOrganization?.uuid,
  );

  const [isLoading, setIsLoading] = useState(false);

  const fetchAttendances = useCallback(async () => {
    if (!enabled || !userUUID || !orgUUID) return;

    setIsLoading(true);

    try {
      let date: string | undefined;

      if (dateRange.start_date && !dateRange.end_date) {
        date = dateRange.start_date;
      }

      if (!dateRange.start_date && dateRange.end_date) {
        date = dateRange.end_date;
      }

      const params = {
        user_uuid: userUUID,
        page: currentPage,
        limit: itemsPerPage,
        status,
        date,
        ...(dateRange.start_date &&
          dateRange.end_date && {
            date_range: dateRange,
          }),
      };

      await dispatch(
        getUserAttendancesAction({
          org_uuid: orgUUID,
          params,
          is_me: "false",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    userUUID,
    orgUUID,
    currentPage,
    itemsPerPage,
    status,
    dateRange.start_date,
    dateRange.end_date,
    dispatch,
  ]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    void fetchAttendances();
  }, [enabled, fetchAttendances]);

  return { fetchAttendances, isLoading };
}