"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetUsers } from "@/features/user/user.slice";
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { useDebounce } from "@/shared/hooks/use-debounce";

export function useInfiniteUserList(limit = 10, enabled = true) {
  const dispatch = useAppDispatch();
  const { users, isLoading, total } = useAppSelector((s) => s.userSlice);
  const orgUuid = useAppSelector((s) => s.organizationsSlice.currentOrganization.uuid);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const pageRef = useRef(1);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !orgUuid) return;
    pageRef.current = 1;
    dispatch(resetUsers());
    dispatch(
      listUserAction({
        org_uuid: orgUuid,
        pagination: { page: 1, limit, search: debouncedSearch },
        isInfiniteScroll: true,
      }),
    );
  }, [enabled, orgUuid, debouncedSearch, limit, dispatch]);

  const onLoadMore = useCallback(() => {
    if (!enabled || fetchingRef.current || isLoading || !orgUuid || users.length >= total) return;
    fetchingRef.current = true;
    pageRef.current += 1;
    dispatch(
      listUserAction({
        org_uuid: orgUuid,
        pagination: { page: pageRef.current, limit, search: debouncedSearch },
        isInfiniteScroll: true,
      }),
    ).finally(() => {
      fetchingRef.current = false;
    });
  }, [enabled, dispatch, orgUuid, limit, debouncedSearch, isLoading, users.length, total]);

  return { users, isLoading, total, onSearch: setSearch, onLoadMore };
}