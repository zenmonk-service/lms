"use client";
import { useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetUsers,
  setPagination,
  UserInterface,
} from "@/features/user/user.slice";
import AttendanceTable from "@/components/attendance/shared/components/table";
import Title from "@/shared/typography/title";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { InfiniteSingleSelect } from "@/shared/infinite-single-select";
import { useDebounce } from "@/shared/hooks/use-debounce";

const Attendance = () => {
  const dispatch = useAppDispatch();
  const {
    users,
    isLoading,
    currentUser,
    total: totalUsers,
  } = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );

  const [search, setSearch] = useState("");
  const [userListPage, setUserListPage] = useState<number>(1);
  const [isFetchingMoreUsers, setIsFetchingMoreUsers] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UserInterface>(currentUser);

  const debouncedSearch = useDebounce(search, 500);

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
            limit: 10,
            search: debouncedSearch,
          },
          isInfiniteScroll: true,
        }),
      );
    }
  }, [currentOrganization.uuid, debouncedSearch, dispatch]);

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
          limit: 10,
          search: debouncedSearch,
        },
        isInfiniteScroll: true,
      }),
    ).finally(() => {
      setIsFetchingMoreUsers(false);
    });
  };

  return (
    <>
      <Title
        title={{ text: "Attendance Management" }}
        description={{ text: "Manage your attendance records and configurations." }}
      />

      <AttendanceTable
        maxHeight="calc(100vh - 357px)"
        user_uuid={selectedEmployee.user_id}
        noDataMessage={"We couldn't find any attendance logs for the selected criteria. Try adjusting your date range."}
      >
        <InfiniteSingleSelect
          value={selectedEmployee}
          onValueChange={setSelectedEmployee}
          data={users}
          total={totalUsers}
          isLoading={isLoading}
          onSearch={setSearch}
          onLoadMore={fetchMoreUsers}
          placeholder="Select Employee"
          ariaInvalid={false}
          className="min-w-50"
        />
      </AttendanceTable>
    </>
  );
};

export default Attendance;
