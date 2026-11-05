"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { bffClient } from "@/config/client";
import { useAppSelector } from "@/store/hooks";
import { useDebounce } from "@/shared/hooks/use-debounce";

export interface UserOption {
  user_id: string;
  name: string;
  email: string;
}

/**
 * Paginated, searchable user options kept in local state, so pickers never
 * overwrite the shared `userSlice.users` list that the user table renders.
 */
export function useUserOptions({
  enabled = true,
  limit = 10,
  isActive = true,
}: { enabled?: boolean; limit?: number; isActive?: boolean } = {}) {
  const orgUuid = useAppSelector(
    (s) => s.organizationsSlice.currentOrganization?.uuid,
  );
  const [users, setUsers] = useState<UserOption[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const pageRef = useRef(1);
  const requestRef = useRef(0);

  const fetchPage = useCallback(
    async (page: number) => {
      const response = await bffClient.get(`/users`, {
        params: {
          page,
          limit,
          search: debouncedSearch,
          ...(isActive !== undefined && { is_active: isActive }),
        },
        headers: { org_uuid: orgUuid, is_filter: "true" },
      });
      return response.json();
    },
    [orgUuid, limit, debouncedSearch, isActive],
  );

  useEffect(() => {
    if (!enabled || !orgUuid) return;
    const requestId = ++requestRef.current;
    pageRef.current = 1;
    setIsLoading(true);
    fetchPage(1)
      .then((data) => {
        if (requestId !== requestRef.current) return;
        setUsers(data.rows || []);
        setCount(data.count || 0);
      })
      .catch(() => {})
      .finally(() => {
        if (requestId === requestRef.current) setIsLoading(false);
      });
  }, [enabled, orgUuid, fetchPage]);

  const onLoadMore = useCallback(() => {
    if (!enabled || isLoading || isLoadingMore || users.length >= count) return;
    const requestId = requestRef.current;
    pageRef.current += 1;
    setIsLoadingMore(true);
    fetchPage(pageRef.current)
      .then((data) => {
        if (requestId !== requestRef.current) return;
        setUsers((prev) => {
          const seen = new Set(prev.map((u) => u.user_id));
          return [...prev, ...(data.rows || []).filter((u: UserOption) => !seen.has(u.user_id))];
        });
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  }, [enabled, isLoading, isLoadingMore, users.length, count, fetchPage]);

  return { users, count, isLoading, isLoadingMore, onSearch: setSearch, onLoadMore };
}
