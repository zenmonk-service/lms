"use client";
import { useEffect, useMemo, useState } from "react";
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";
import { useAppDispatch, useAppSelector } from "@/store";
import { listTeamOptionsAction } from "@/features/team/team.action";
import type { TeamOption } from "@/features/team/team.type";

/** Multi-select over every team (the filter endpoint returns them unpaginated). */
export function TeamMultiPicker({
  value,
  onChange,
  disabled,
  placeholder = "Select teams",
}: {
  value: string[];
  onChange: (teamUuids: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const dispatch = useAppDispatch();
  const orgUuid = useAppSelector(
    (s) => s.organizationsSlice.currentOrganization?.uuid,
  );
  const teams = useAppSelector((s) => s.teamSlice.teamOptions);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (orgUuid) dispatch(listTeamOptionsAction({ org_uuid: orgUuid }));
  }, [orgUuid, dispatch]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return teams;
    // Keep selected teams rendered so their chips keep a label.
    return teams.filter(
      (t) => value.includes(t.uuid) || t.name.toLowerCase().includes(term),
    );
  }, [teams, search, value]);

  if (disabled) {
    const names = teams.filter((t) => value.includes(t.uuid)).map((t) => t.name);
    return (
      <div className="flex min-h-9 items-center rounded-md border bg-muted px-3 py-1.5 text-sm font-medium">
        <span className="truncate">{names.length ? names.join(", ") : "—"}</span>
      </div>
    );
  }

  return (
    <InfiniteMultiSelect<TeamOption>
      value={value}
      onValuesChange={onChange}
      data={filtered}
      total={filtered.length}
      isLoading={false}
      isLoadingMore={false}
      onSearch={setSearch}
      onLoadMore={() => {}}
      getValue={(t) => t.uuid}
      getLabel={(t) => t.name}
      placeholder={placeholder}
    />
  );
}
