"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfiniteSingleSelect } from "@/shared/infinite-single-select";
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";
import { useUserOptions, type UserOption } from "@/shared/hooks/use-user-options";

const label = (u: UserOption) => `${u.name} (${u.email})`;

export function UserPicker({
  value,
  onChange,
  placeholder = "Select user",
  excludeUserIds = [],
  disabled,
  "aria-invalid": ariaInvalid,
}: {
  value?: UserOption | null;
  onChange: (user: UserOption | null) => void;
  placeholder?: string;
  excludeUserIds?: string[];
  disabled?: boolean;
  "aria-invalid"?: boolean;
}) {
  const [hasOpened, setHasOpened] = useState(false);
  const { users, count, isLoading, onSearch, onLoadMore } = useUserOptions({
    enabled: hasOpened,
  });
  const exclude = new Set(excludeUserIds);

  if (disabled) {
    return (
      <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-medium">
        <span className="truncate">{value ? label(value) : "—"}</span>
      </div>
    );
  }

  return (
    <InfiniteSingleSelect<UserOption>
      value={value ?? undefined}
      onValueChange={(user) => onChange(user ?? null)}
      onOpenChange={(open) => open && setHasOpened(true)}
      data={users.filter((u) => !exclude.has(u.user_id))}
      total={count}
      isLoading={isLoading}
      onSearch={onSearch}
      onLoadMore={onLoadMore}
      getValue={(u) => u.user_id}
      getLabel={label}
      placeholder={placeholder}
      clearable
      aria-invalid={ariaInvalid}
    />
  );
}

export function UserMultiPicker({
  value,
  onChange,
  placeholder = "Select users",
  excludeUserIds = [],
}: {
  value: string[];
  onChange: (userIds: string[]) => void;
  placeholder?: string;
  excludeUserIds?: string[];
}) {
  const [hasOpened, setHasOpened] = useState(false);
  const { users, count, isLoading, isLoadingMore, onSearch, onLoadMore } =
    useUserOptions({ enabled: hasOpened });
  const exclude = new Set(excludeUserIds);

  return (
    <InfiniteMultiSelect<UserOption>
      value={value}
      onValuesChange={onChange}
      onOpenChange={(open) => open && setHasOpened(true)}
      data={users.filter((u) => !exclude.has(u.user_id))}
      total={count}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      onSearch={onSearch}
      onLoadMore={onLoadMore}
      getValue={(u) => u.user_id}
      getLabel={label}
      placeholder={placeholder}
    />
  );
}

/**
 * Several people shown as removable chips, plus a search to add one more. Unlike
 * UserMultiPicker it keeps names for people that aren't in the loaded page.
 */
export function UserListPicker({
  value,
  onChange,
  placeholder = "Add a person",
  emptyLabel = "None",
  excludeUserIds = [],
  disabled,
}: {
  value: UserOption[];
  onChange: (users: UserOption[]) => void;
  placeholder?: string;
  /** Shown when read-only and nobody is selected. */
  emptyLabel?: string;
  excludeUserIds?: string[];
  disabled?: boolean;
}) {
  const selectedIds = value.map((user) => user.user_id);

  if (disabled) {
    return (
      <div className="flex min-h-9 flex-wrap items-center gap-1 rounded-md border bg-muted px-3 py-1.5 text-sm">
        {value.length ? (
          value.map((user) => (
            <Badge key={user.user_id} variant="secondary">
              {user.name}
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground">{emptyLabel}</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((user) => (
            <Badge key={user.user_id} variant="secondary" className="gap-1 pr-1" title={user.email}>
              {user.name}
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-background"
                onClick={() => onChange(value.filter((u) => u.user_id !== user.user_id))}
                aria-label={`Remove ${user.name}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <UserPicker
        value={null}
        onChange={(user) => user && onChange([...value, user])}
        placeholder={placeholder}
        excludeUserIds={[...excludeUserIds, ...selectedIds]}
      />
    </div>
  );
}
