import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { getUserAttendancesAction } from "@/features/attendances/get-user-attendances/get-user-attendances.action";

interface Params {
  dateRange: { start_date?: string; end_date?: string };
  currentPage: number;
  itemsPerPage: number;
  userUUID: string;
}

export function useAttendanceFetch({ dateRange, currentPage, itemsPerPage, userUUID }: Params) {
  const dispatch = useAppDispatch();
  const orgUUID = useAppSelector((s) => s.organizationsSlice.currentOrganization.uuid);
  
  const [isLoading, setIsLoading] = useState(false);

  const fetchAttendances = async () => {
    if (!userUUID) return;
    setIsLoading(true);

    let date: string | undefined = undefined;
    if(dateRange.start_date && !dateRange.end_date) date = dateRange.start_date;
    if(!dateRange.start_date && dateRange.end_date) date = dateRange.end_date;

    await dispatch(
      getUserAttendancesAction({
        org_uuid: orgUUID,
        user_uuid: userUUID,
        page: currentPage,
        limit: itemsPerPage,
        date,
        ...(dateRange.end_date && dateRange.start_date && { date_range: dateRange }),
      }),
    );
    setIsLoading(false);
  };

  useEffect(() => { fetchAttendances(); }, [dateRange, currentPage, userUUID ,itemsPerPage]);

  return { fetchAttendances, isLoading };
}