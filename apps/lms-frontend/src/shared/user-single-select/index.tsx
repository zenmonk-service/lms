"use client";
import { cn } from "@/lib/utils";
import { UserInterface } from "@/features/user/user.type";
import { InfiniteSingleSelect } from "@/shared/infinite-single-select";
import { useInfiniteUserList } from "@/shared/hooks/use-infinite-user-list";

interface IProps {
  value?: UserInterface;
  onValueChange: (user: UserInterface) => void;
  className?: string;
  clearable?: boolean;
}

export function UserSingleSelect({ value, onValueChange, className }: IProps) {
  const { users, isLoading, total, onSearch, onLoadMore } = useInfiniteUserList();

  return (
    <InfiniteSingleSelect
      value={value}
      onValueChange={(user) => {
        if (user) onValueChange(user);
      }}
      data={users}
      total={total}
      isLoading={isLoading}
      onSearch={onSearch}
      onLoadMore={onLoadMore}
      getValue={(u) => u.user_id}
      getLabel={(u) => `${u.name} (${u.email})`}
      placeholder="Select Employee"
      className={cn("min-w-50", className)}
      clearable
    />
  );
}