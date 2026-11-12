"use client";

import React, { useMemo, useState } from "react";
import { Loader2, UserPlus, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QueryMember } from "@/features/query/query.types";
import { getInitials } from "@/utils/query";
import { AddMembersDialog } from "./add-members-dialog";

const ROLE_LABELS: Record<string, string> = {
  PRIMARY_ASSIGNEE: "Primary assignee",
  ASSIGNEE: "Assignee",
  RESOLVER: "Resolver",
  WATCHER: "Watcher",
};

const roleLabel = (role: string) =>
  ROLE_LABELS[role] ??
  role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

interface QueryMembersProps {
  queryUuid: string;
  members: QueryMember[];
  /** `user_id` (uuid) of the signed-in user: never offered for adding or removal. */
  currentUserId?: string | null;
  /** Resolves to true when the members were added. */
  onAddMembers?: (queryUuid: string, userUuids: string[]) => Promise<boolean>;
  onRemoveMember?: (queryUuid: string, memberUuid: string) => Promise<void>;
}

export function QueryMembers({
  queryUuid,
  members,
  currentUserId,
  onAddMembers,
  onRemoveMember,
}: QueryMembersProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberPendingRemoval, setMemberPendingRemoval] =
    useState<QueryMember | null>(null);
  const [removingUuid, setRemovingUuid] = useState<string | null>(null);

  const excludedUserIds = useMemo(
    () => [
      ...(currentUserId ? [currentUserId] : []),
      ...members.flatMap((member) =>
        member.user?.user_id ? [member.user.user_id] : [],
      ),
    ],
    [currentUserId, members],
  );

  const confirmRemove = async () => {
    const member = memberPendingRemoval;
    setMemberPendingRemoval(null);
    if (!member || !onRemoveMember) return;

    setRemovingUuid(member.uuid);
    try {
      await onRemoveMember(queryUuid, member.uuid);
    } finally {
      setRemovingUuid(null);
    }
  };

  return (
    <div className="rounded-xl bg-card p-3 ring-1 ring-border">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          Members
          <span className="rounded-full bg-muted px-1.5 py-px text-[10px] normal-case tracking-normal">
            {members.length}
          </span>
        </h3>
        {onAddMembers && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1 rounded-full px-2.5 text-xs text-primary hover:text-primary"
            onClick={() => setIsAddOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>

      <ul className="space-y-1">
        {members.map((member) => {
          const isMe = member.user?.user_id === currentUserId;
          const canRemove = Boolean(onRemoveMember) && !isMe;
          const isRemoving = removingUuid === member.uuid;
          const name = member.user?.name ?? "Unknown user";

          return (
            <li
              key={member.uuid}
              className="flex items-center gap-2.5 rounded-lg px-1 py-1"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage
                  src={member.user?.image ?? undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {name}
                  {isMe && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      (You)
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {roleLabel(member.role)}
                </p>
              </div>
              {canRemove &&
                (isRemoving ? (
                  <Loader2 className="mr-1.5 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                    onClick={() => setMemberPendingRemoval(member)}
                    disabled={Boolean(removingUuid)}
                    aria-label={`Remove ${name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ))}
            </li>
          );
        })}
      </ul>

      {onAddMembers && (
        <AddMembersDialog
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          excludedUserIds={excludedUserIds}
          onSubmit={(userUuids) => onAddMembers(queryUuid, userUuids)}
        />
      )}

      <AlertDialog
        open={Boolean(memberPendingRemoval)}
        onOpenChange={(open) => !open && setMemberPendingRemoval(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberPendingRemoval?.user?.name ?? "This member"} will be
              removed from this query.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
