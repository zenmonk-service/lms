"use client";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetUsers,
  setPagination,
  UserInterface,
} from "@/features/user/user.slice";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { InfiniteSingleSelect } from "@/shared/infinite-single-select";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface IProps {
  selectedEmployee?: UserInterface;
  setSelectedEmployee: (employee: UserInterface) => void;
}

const ListUserInfiniteScroll = ({ selectedEmployee, setSelectedEmployee }: IProps) => {
  const dispatch = useAppDispatch();
  const {
    users,
    isLoading,
    total: totalUsers,
  } = useAppSelector((state) => state.userSlice);
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);

  const [search, setSearch] = useState("");
  const [userListPage, setUserListPage] = useState<number>(1);
  const [isFetchingMoreUsers, setIsFetchingMoreUsers] = useState(false);

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
  );
};

export default ListUserInfiniteScroll;
