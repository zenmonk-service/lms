import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getUserAttendancesAction } from "@/features/attendances/get-user-attendances/get-user-attendances.action";
import { AttendanceStatus } from "@/features/attendances/attendances.type";

interface Params {
  dateRange: { start_date?: string; end_date?: string };
  currentPage: number;
  itemsPerPage: number;
  userUUID: string;
  status?: AttendanceStatus;
}

export function useAttendanceFetch({ dateRange, currentPage, itemsPerPage, userUUID, status }: Params) {
  const dispatch = useAppDispatch();
  const orgUUID = useAppSelector((s) => s.organizationsSlice.currentOrganization.uuid);
  
  const [isLoading, setIsLoading] = useState(false);

  const fetchAttendances = async () => {
    if (!userUUID) return;
    setIsLoading(true);

    let date: string | undefined = undefined;
    if(dateRange.start_date && !dateRange.end_date) date = dateRange.start_date;
    if(!dateRange.start_date && dateRange.end_date) date = dateRange.end_date;

    const params = {
      user_uuid: userUUID,
      page: currentPage,
      limit: itemsPerPage,
      status,
      date,
      ...(dateRange.end_date && dateRange.start_date && { date_range: dateRange }),
    };

    await dispatch(
      getUserAttendancesAction({
        org_uuid: orgUUID,
        params,
      }),
    );
    setIsLoading(false);
  };

  useEffect(() => { fetchAttendances(); }, [dateRange, currentPage, userUUID ,itemsPerPage, status]);

  return { fetchAttendances, isLoading };
}