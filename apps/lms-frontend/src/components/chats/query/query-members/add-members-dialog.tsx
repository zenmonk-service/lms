"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";
import { useInfiniteUserList } from "@/shared/hooks/use-infinite-user-list";
import { UserInterface } from "@/features/user/user.type";
import { QUERY_LIMITS } from "@/features/query/query.constants";

/** Picker for adding people to a query; yourself and current members are hidden. */
export function AddMembersDialog({
  open,
  onOpenChange,
  excludedUserIds,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Yourself and current members: hidden from the picker. */
  excludedUserIds: string[];
  onSubmit: (userUuids: string[]) => Promise<boolean>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const { users, isLoading, isLoadingMore, count, onSearch, onLoadMore } =
    useInfiniteUserList(10, open && isPickerOpen, "true");

  const excluded = useMemo(() => new Set(excludedUserIds), [excludedUserIds]);
  const availableUsers = useMemo(
    () =>
      (users as UserInterface[]).filter((user) => !excluded.has(user.user_id)),
    [users, excluded],
  );
  // Keep "has more" correct for the picker after hiding excluded users.
  const availableTotal = Math.max(
    0,
    count - (users.length - availableUsers.length),
  );

  const handleSubmit = async () => {
    if (!selected.length) return;
    setIsSubmitting(true);
    try {
      if (await onSubmit(selected)) onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !isSubmitting && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add members</DialogTitle>
          <DialogDescription>
            They&apos;ll see this query and its conversation.
          </DialogDescription>
        </DialogHeader>

        <InfiniteMultiSelect
          value={selected}
          onValuesChange={setSelected}
          onOpenChange={setIsPickerOpen}
          data={availableUsers}
          total={availableTotal}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          onSearch={onSearch}
          onLoadMore={onLoadMore}
          getValue={(user: UserInterface) => user.user_id}
          getLabel={(user: UserInterface) => `${user.name} (${user.email})`}
          placeholder="Select people"
          className="w-full"
        />

        {selected.length > QUERY_LIMITS.MEMBERS_PER_REQUEST_MAX && (
          <p className="text-xs text-destructive">
            You can add at most {QUERY_LIMITS.MEMBERS_PER_REQUEST_MAX} people at
            once.
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              !selected.length ||
              isSubmitting ||
              selected.length > QUERY_LIMITS.MEMBERS_PER_REQUEST_MAX
            }
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add{selected.length > 1 ? ` ${selected.length}` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
