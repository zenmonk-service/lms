import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getUserTodayAttendancesAction } from "@/features/attendances/get-user-today-attendances/get-user-today-attendances.action";
import { getUserAttendancesAction } from "@/features/attendances/get-user-attendances/get-user-attendances.action";

interface Params {
  dateRange: { start_date?: string; end_date?: string };
  currentPage: number;
  itemsPerPage: number;
}

export function useAttendanceFetch({ dateRange, currentPage, itemsPerPage }: Params) {
  const dispatch = useAppDispatch();
  const orgUUID = useAppSelector((s) => s.organizationsSlice.currentOrganization.uuid);
  const userUUID = useAppSelector((s) => s.userSlice.currentUser?.user_id);

  const fetchAttendances = () => {
    if (!userUUID) return;
    dispatch(
      getUserAttendancesAction({
        org_uuid: orgUUID,
        user_uuid: userUUID,
        page: currentPage,
        limit: itemsPerPage,
        ...(dateRange.end_date && dateRange.start_date && { date_range: dateRange }),
      }),
    );
  };

  useEffect(() => { fetchAttendances(); }, [dateRange, currentPage]);

  return { fetchAttendances };
}