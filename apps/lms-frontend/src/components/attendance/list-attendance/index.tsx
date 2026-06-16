"use client";
import { useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetUsers, setPagination } from "@/features/user/user.slice";
import AttendanceTable from "@/components/attendance/shared/components/table";
import Title from "@/shared/typography/title";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { getUserAttendancesAction } from "@/features/attendances/get-user-attendances/get-user-attendances.action";
import { InfiniteSingleSelect } from "@/shared/infinite-single-select";
const Attendance = () => {
  const { users, isLoading , currentUser} = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const userAttendance = useAppSelector(
    (state) => state.attendancesSlice.attendances,
  );
  const userAttendanceLoading = useAppSelector(
    (state) => state.attendancesSlice.loading,
  );
  const totalUsers = useAppSelector((state) => state.userSlice.total);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const dispatch = useAppDispatch();
  const [selectedEmployee, setSelectedEmployee] = useState<string>(currentUser?.user_id);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userListPage, setUserListPage] = useState<number>(1);
  const [isFetchingMoreUsers, setIsFetchingMoreUsers] = useState(false);
  const [itemsPerPage] = useState<number>(10);
  const [usersPerPage] = useState<number>(10);
  const [dateRange, setDateRange] = useState<{
    start_date?: string;
    end_date?: string;
  }>({
    start_date: undefined,
    end_date: undefined,
  });
  const totalPages = Math.ceil((userAttendance?.total || 0) / itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    dispatch(setPagination({ page: 1, limit: 50, search: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (currentOrganization.uuid) {
      setUserListPage(1);
      dispatch(resetUsers());
      dispatch(
        listUserAction({
          org_uuid: currentOrganization.uuid,
          pagination: {
            page: 1,
            limit: usersPerPage,
            search: debouncedSearch?.trim(),
          },
          isInfiniteScroll: true,
        }),
      );
    }
  }, [currentOrganization.uuid, debouncedSearch, dispatch, usersPerPage]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);
    const handleSearchDebounced = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);
  };


  const fetchMoreUsers = () => {
    if (
      isLoading ||
      isFetchingMoreUsers ||
      !currentOrganization.uuid ||
      users.length >= totalUsers
    ) {
      return;
    }

    const nextPage = userListPage + 1;
    setIsFetchingMoreUsers(true);
    setUserListPage(nextPage);

    dispatch(
      listUserAction({
        org_uuid: currentOrganization.uuid,
        pagination: {
          page: nextPage,
          limit: usersPerPage,
          search: debouncedSearch?.trim(),
        },
        isInfiniteScroll: true,
      }),
    ).finally(() => {
      setIsFetchingMoreUsers(false);
    });
  };


  useEffect(() => {
    if (selectedEmployee) {
      dispatch(
        getUserAttendancesAction({
          org_uuid: currentOrganization.uuid,
          user_uuid: selectedEmployee,
          page: currentPage,
          limit: itemsPerPage,
          ...(dateRange.end_date && { date_range: dateRange }),
        }),
      );
    }
  }, [
    dateRange?.end_date,
    currentPage,
    selectedEmployee,
    currentOrganization.uuid,
  ]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-11/12 min-[1400px]:w-3/4 p-6">
        <Title
          title={{
            text: "Attendance Management",
            className: "",
          }}
          description={{
            text: "Manage your attendance records and configurations.",
            className: "",
          }}
          className=""
        />

        <div className="flex flex-col gap-8">
          <InfiniteSingleSelect
            value={selectedEmployee}
            onValueChange={setSelectedEmployee}
            data={users}
            total={totalUsers}
            isLoading={isLoading}
            onSearch={handleSearchDebounced}
            onLoadMore={fetchMoreUsers}
            placeholder="Select Manager"
            ariaInvalid={false}
          />

          <main className="flex-1">
            {selectedEmployee ? (
              <AttendanceTable
                setDateRange={setDateRange}
                userAttendance={userAttendance}
                userAttendanceLoading={userAttendanceLoading}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                expandedRowId={expandedRowId}
                setExpandedRowId={setExpandedRowId}
                noDataMessage={
                  "We couldn't find any attendance logs for the selected criteria. Try adjusting your date range."
                }
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-primary mb-6">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">
                  Select an employee
                </h3>
                <p className="text-card-foreground max-w-xs mx-auto">
                  Click on an employee from the list to view their detailed
                  attendance history, statistics, and logs.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
