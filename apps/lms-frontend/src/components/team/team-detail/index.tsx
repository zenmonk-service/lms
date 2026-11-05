"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, LoaderCircle, Network, Pencil, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserAvatar from "@/shared/user-avatar";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addTeamMembersAction,
  getTeamAction,
  removeTeamMemberAction,
  updateTeamAction,
} from "@/features/team/team.action";
import { clearSelectedTeam } from "@/features/team/team.slice";
import type { TeamMember } from "@/features/team/team.type";
import { UserMultiPicker } from "../pickers/user-picker";
import CreateUser from "@/components/user/create-user";

export default function TeamDetailSheet({
  teamUuid,
  onOpenChange,
  canUpdate,
  onEdit,
  onChanged,
  onShowOnCanvas,
  canCreatePeople = false,
}: {
  canCreatePeople?: boolean;
  teamUuid: string | null;
  onOpenChange: (open: boolean) => void;
  canUpdate: boolean;
  onEdit: () => void;
  onChanged: () => void;
  onShowOnCanvas?: (teamUuid: string) => void;
}) {
  const dispatch = useAppDispatch();
  const orgUuid = useAppSelector(
    (s) => s.organizationsSlice.currentOrganization?.uuid,
  );
  const { selectedTeam: team, isDetailLoading, isSaving } = useAppSelector(
    (s) => s.teamSlice,
  );

  const [newMemberIds, setNewMemberIds] = useState<string[]>([]);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [creatingMember, setCreatingMember] = useState(false);

  useEffect(() => {
    setNewMemberIds([]);
    if (teamUuid && orgUuid) {
      dispatch(getTeamAction({ org_uuid: orgUuid, team_uuid: teamUuid }));
    } else {
      dispatch(clearSelectedTeam());
    }
  }, [teamUuid, orgUuid, dispatch]);

  const refresh = async () => {
    if (!teamUuid || !orgUuid) return;
    await dispatch(getTeamAction({ org_uuid: orgUuid, team_uuid: teamUuid }));
    onChanged();
  };

  const addMembers = async () => {
    if (!teamUuid || !orgUuid || !newMemberIds.length) return;
    const result = await dispatch(
      addTeamMembersAction({
        org_uuid: orgUuid,
        team_uuid: teamUuid,
        user_uuids: newMemberIds,
      }),
    );
    if (addTeamMembersAction.fulfilled.match(result)) {
      setNewMemberIds([]);
      await refresh();
    }
  };

  const makeLead = async (member: TeamMember) => {
    if (!teamUuid || !orgUuid) return;
    const result = await dispatch(
      updateTeamAction({
        org_uuid: orgUuid,
        team_uuid: teamUuid,
        lead_uuid: member.user_id,
      }),
    );
    if (updateTeamAction.fulfilled.match(result)) await refresh();
  };

  const confirmRemove = async () => {
    if (!teamUuid || !orgUuid || !removing) return;
    await dispatch(
      removeTeamMemberAction({
        org_uuid: orgUuid,
        team_uuid: teamUuid,
        user_uuid: removing.user_id,
      }),
    ).unwrap();
    await refresh();
  };

  const loading = isDetailLoading && !team;
  const memberIds = team?.members.map((m) => m.user_id) ?? [];

  return (
    <>
      <Sheet open={!!teamUuid} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-start justify-between gap-2 pr-6">
              <div className="min-w-0">
                <SheetTitle className="truncate">
                  {loading ? <Skeleton className="h-6 w-40" /> : team?.name}
                </SheetTitle>
                <SheetDescription>
                  {loading ? (
                    <Skeleton className="mt-2 h-4 w-56" />
                  ) : (
                    team?.description || "No description"
                  )}
                </SheetDescription>
              </div>
              {team && (
                <div className="flex shrink-0 gap-2">
                  {onShowOnCanvas && (
                    <Button variant="outline" size="sm" onClick={() => onShowOnCanvas(team.uuid)}>
                      <Network className="h-4 w-4" />
                      Canvas
                    </Button>
                  )}
                  {canUpdate && (
                    <Button variant="outline" size="sm" onClick={onEdit}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-6">
            {canUpdate && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Add members</p>
                  {canCreatePeople && team && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setCreatingMember(true)}
                    >
                      <UserPlus className="h-3.5 w-3.5" /> New person
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <UserMultiPicker
                      value={newMemberIds}
                      onChange={setNewMemberIds}
                      excludeUserIds={memberIds}
                      placeholder="Search people to add"
                    />
                  </div>
                  <Button
                    onClick={addMembers}
                    disabled={!newMemberIds.length || isSaving}
                  >
                    {isSaving ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    Add
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Members</p>
              <Badge variant="secondary">{team?.member_count ?? 0}</Badge>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !team?.members.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No members yet.
              </p>
            ) : (
              <ul className="divide-y rounded-md border">
                {team.members.map((member) => (
                  <li
                    key={member.user_id}
                    className="flex items-center justify-between gap-2 p-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <Link
                        href={`/${orgUuid}/user-management/${member.user_id}/details`}
                        className="hover:underline"
                      >
                        <UserAvatar
                          user={{
                            name: member.name,
                            email: member.email,
                            image: member.image ?? undefined,
                          }}
                        />
                      </Link>
                      <div className="flex flex-wrap items-center gap-1 pl-10">
                        {member.is_lead && (
                          <Badge variant="recommended">
                            <Crown /> Lead
                          </Badge>
                        )}
                        {member.role && (
                          <Badge variant="outline">{member.role.name}</Badge>
                        )}
                        {!member.is_active && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                        {member.managers.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Reports to{" "}
                            {member.managers.map((manager) => manager.name).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {canUpdate && (
                      <div className="flex shrink-0 items-center">
                        {!member.is_lead && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isSaving}
                                onClick={() => makeLead(member)}
                              >
                                <Crown className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Make team lead</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRemoving(member)}
                            >
                              <UserMinus className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove from team</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {canCreatePeople && orgUuid && team && (
        <CreateUser
          org_uuid={orgUuid}
          open={creatingMember}
          onOpenChange={setCreatingMember}
          defaultTeamUuids={[team.uuid]}
          onCreated={refresh}
        />
      )}

      <ConfirmationDialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={`Remove ${removing?.name ?? "member"}?`}
        description={
          removing?.is_lead
            ? "This person is the team lead. Removing them also clears the team's lead."
            : "They will no longer be part of this team."
        }
        isLoading={isSaving}
        handleConfirm={confirmRemove}
      />
    </>
  );
}
