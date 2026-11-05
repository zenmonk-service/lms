"use client";

import { useCallback, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Ellipsis,
  Eye,
  Network,
  Pencil,
  Plus,
  Trash2,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable from "@/shared/table";
import UserAvatar from "@/shared/user-avatar";
import { OverflowClipBadges } from "@/shared/overflow-clip-badges";
import { ConfirmationDialog } from "@/shared/confirmation-dialog";
import { useAppDispatch, useAppSelector } from "@/store";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import {
  deleteTeamAction,
  getTeamAction,
  listTeamsAction,
} from "@/features/team/team.action";
import { setTeamPagination } from "@/features/team/team.slice";
import type { Team } from "@/features/team/team.type";
import TeamFormDialog from "../team-form";
import TeamDetailSheet from "../team-detail";

// The shared DropdownMenuItem predates icon support, so size and space icons here.
const menuItem =
  "gap-2.5 py-2 cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";
const destructiveItem = `${menuItem} text-destructive focus:bg-destructive/10 focus:text-destructive [&_svg]:!text-destructive`;

export default function ListTeamManagement({
  onShowOnCanvas,
  canCreatePeople = false,
}: {
  /** Can create users (shows "New person" in a team's sheet). */
  canCreatePeople?: boolean;
  /** Opens the hierarchy canvas with this team highlighted. */
  onShowOnCanvas?: (teamUuid: string) => void;
}) {
  const dispatch = useAppDispatch();
  const orgUuid = useAppSelector(
    (s) => s.organizationsSlice.currentOrganization?.uuid,
  );
  const { teams, count, isLoading, isSaving, pagination, selectedTeam } =
    useAppSelector((s) => s.teamSlice);

  const can = usePermissionCheck();
  const canRead = can(PermissionTag.TEAM_MANAGEMENT, PermissionAction.READ);
  const canCreate = can(PermissionTag.TEAM_MANAGEMENT, PermissionAction.CREATE);
  const canUpdate = can(PermissionTag.TEAM_MANAGEMENT, PermissionAction.UPDATE);
  const canDelete = can(PermissionTag.TEAM_MANAGEMENT, PermissionAction.DELETE);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [viewingUuid, setViewingUuid] = useState<string | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);

  const fetchTeams = useCallback(() => {
    if (orgUuid && canRead) {
      dispatch(listTeamsAction({ org_uuid: orgUuid, pagination }));
    }
  }, [orgUuid, canRead, pagination, dispatch]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const openCreate = () => {
    setEditingTeam(null);
    setFormOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!orgUuid || !deletingTeam) return;
    await dispatch(
      deleteTeamAction({ org_uuid: orgUuid, team_uuid: deletingTeam.uuid }),
    ).unwrap();
    if (viewingUuid === deletingTeam.uuid) setViewingUuid(null);
    // Step back a page if we just removed the last row on it.
    if (teams.length === 1 && pagination.page > 1) {
      dispatch(setTeamPagination({ page: pagination.page - 1 }));
    } else {
      fetchTeams();
    }
  };

  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: "name",
      header: "Team",
      cell: ({ row }) => (
        <button
          type="button"
          className="group flex items-center gap-3 text-left"
          onClick={() => setViewingUuid(row.original.uuid)}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
            <UsersRound className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium group-hover:underline">
              {row.original.name}
            </p>
            <p className="max-w-64 truncate text-xs text-muted-foreground">
              {row.original.description || "No description"}
            </p>
          </div>
        </button>
      ),
    },
    {
      id: "lead",
      header: "Lead",
      cell: ({ row }) =>
        row.original.lead ? (
          <UserAvatar
            user={{
              name: row.original.lead.name,
              email: row.original.lead.email,
              image: row.original.lead.image ?? undefined,
            }}
          />
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: "members",
      header: () => <div className="w-72">Members</div>,
      cell: ({ row }) => {
        const members = row.original.members ?? [];
        return members.length ? (
          <div className="max-w-72">
            <OverflowClipBadges labels={members.map((member) => member.name)} />
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No members</span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div />,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${row.original.name}`}>
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1">
              <DropdownMenuItem className={menuItem} onSelect={() => setViewingUuid(row.original.uuid)}>
                <Eye /> View members
              </DropdownMenuItem>
              {onShowOnCanvas && (
                <DropdownMenuItem className={menuItem} onSelect={() => onShowOnCanvas(row.original.uuid)}>
                  <Network /> Show on canvas
                </DropdownMenuItem>
              )}
              {canUpdate && (
                <DropdownMenuItem className={menuItem} onSelect={() => openEdit(row.original)}>
                  <Pencil /> Edit team
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem className={destructiveItem} onSelect={() => setDeletingTeam(row.original)}>
                    <Trash2 /> Delete team
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        hasPermission={canRead}
        moduleName="Teams"
        data={teams}
        columns={columns}
        isLoading={isLoading}
        totalCount={count}
        pagination={{ page: pagination.page, limit: pagination.limit }}
        onPaginationChange={(next) => dispatch(setTeamPagination(next))}
        searchValue={pagination.search}
        onSearchChange={(search) =>
          dispatch(setTeamPagination({ search, page: 1 }))
        }
        searchPlaceholder="Search teams by name..."
        noDataMessage={
          pagination.search
            ? "No team matches your search."
            : "Create a team to group people and assign a team lead."
        }
      >
        {canCreate && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-5" />
            <span className="hidden sm:block">Create Team</span>
          </Button>
        )}
      </DataTable>

      <TeamFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        team={editingTeam}
        onSaved={(uuid) => {
          fetchTeams();
          if (uuid && viewingUuid === uuid && orgUuid) {
            dispatch(getTeamAction({ org_uuid: orgUuid, team_uuid: uuid }));
          }
        }}
      />

      <TeamDetailSheet
        teamUuid={viewingUuid}
        onOpenChange={(open) => !open && setViewingUuid(null)}
        canUpdate={canUpdate}
        onEdit={() => selectedTeam && openEdit(selectedTeam)}
        onChanged={fetchTeams}
        canCreatePeople={canCreatePeople}
        onShowOnCanvas={
          onShowOnCanvas
            ? (uuid) => {
                setViewingUuid(null);
                onShowOnCanvas(uuid);
              }
            : undefined
        }
      />

      <ConfirmationDialog
        open={!!deletingTeam}
        onOpenChange={(open) => !open && setDeletingTeam(null)}
        title={`Delete "${deletingTeam?.name ?? "team"}"?`}
        description="All members are removed from this team. People and their reporting lines are not affected."
        isLoading={isSaving}
        handleConfirm={confirmDelete}
      />
    </>
  );
}
