"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import {
  addTeamMembers,
  getHierarchy,
  setManagers as setManagersRequest,
  setUserTeams as setUserTeamsRequest,
} from "@/features/team/team.service";
import type { ManagerLineInput, OrgGraph } from "@/features/team/team.type";
import { indexHierarchy, type OrgIndex } from "./layout";

const EMPTY: OrgGraph = { people: [], lines: [] };

/** A user's current lines in the shape `PUT /users/:uuid/managers` takes. */
const linesInput = (index: OrgIndex, userId: string): ManagerLineInput[] =>
  (index.managerLines.get(userId) ?? []).map((line) => ({
    manager_uuid: line.manager_id,
    team_uuid: line.team?.uuid ?? null,
  }));

/** Loads the whole org graph and exposes the mutations the canvas needs. */
export function useOrgHierarchy(enabled: boolean) {
  const orgUuid = useAppSelector(
    (s) => s.organizationsSlice.currentOrganization?.uuid,
  );
  const [graph, setGraph] = useState<OrgGraph>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);

  const reload = useCallback(async () => {
    if (!orgUuid || !enabled) return;
    try {
      const res = await getHierarchy(orgUuid);
      setGraph(await res.json());
    } catch (err) {
      toastError(normalizeApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  }, [orgUuid, enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  const index = useMemo(() => indexHierarchy(graph), [graph]);
  const nameOf = useCallback(
    (id: string) => index.people.get(id)?.name ?? "Someone",
    [index],
  );

  const mutate = useCallback(
    async (call: () => Promise<Response>, message: string) => {
      if (!orgUuid) return false;
      setIsMutating(true);
      try {
        await call();
        toastSuccess(message);
        await reload();
        return true;
      } catch (err) {
        toastError(normalizeApiError(err).message);
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [orgUuid, reload],
  );

  const saveLines = useCallback(
    (userId: string, lines: ManagerLineInput[], message: string) =>
      mutate(() => setManagersRequest(orgUuid!, userId, lines), message),
    [mutate, orgUuid],
  );

  /** Adds a line `userId` → `managerId`, within `teamUuid` (null = outside teams). */
  const addManager = useCallback(
    (userId: string, managerId: string, teamUuid: string | null = null) => {
      const team = teamUuid
        ? index.people.get(userId)?.teams.find((t) => t.uuid === teamUuid)
        : null;
      return saveLines(
        userId,
        [...linesInput(index, userId), { manager_uuid: managerId, team_uuid: teamUuid }],
        `${nameOf(userId)} now reports to ${nameOf(managerId)}${team ? ` in ${team.name}` : ""}`,
      );
    },
    [index, nameOf, saveLines],
  );

  /** Removes every line from `userId` to `managerId`. */
  const removeManager = useCallback(
    (userId: string, managerId: string) =>
      saveLines(
        userId,
        linesInput(index, userId).filter((line) => line.manager_uuid !== managerId),
        `${nameOf(userId)} no longer reports to ${nameOf(managerId)}`,
      ),
    [index, nameOf, saveLines],
  );

  /** Removes one line (a specific team, or the outside-team one). */
  const removeLine = useCallback(
    (userId: string, managerId: string, teamUuid: string | null) =>
      saveLines(
        userId,
        linesInput(index, userId).filter(
          (line) => !(line.manager_uuid === managerId && line.team_uuid === teamUuid),
        ),
        `Removed a reporting line for ${nameOf(userId)}`,
      ),
    [index, nameOf, saveLines],
  );

  /**
   * Moves `userId`'s lines from `fromId` to `toId`. A team line keeps its team when
   * the new manager is in that team, otherwise it becomes an outside-team line.
   */
  const moveManager = useCallback(
    (userId: string, fromId: string, toId: string) => {
      const toTeams = new Set(index.people.get(toId)?.teams.map((t) => t.uuid));
      const seen = new Set<string>();
      const next = linesInput(index, userId)
        .map((line) =>
          line.manager_uuid !== fromId
            ? line
            : {
                manager_uuid: toId,
                team_uuid: line.team_uuid && toTeams.has(line.team_uuid) ? line.team_uuid : null,
              },
        )
        .filter((line) => {
          const key = `${line.manager_uuid}:${line.team_uuid ?? ""}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      return saveLines(userId, next, `${nameOf(userId)} now reports to ${nameOf(toId)} instead of ${nameOf(fromId)}`);
    },
    [index, nameOf, saveLines],
  );

  const setTeams = useCallback(
    (userId: string, teamUuids: string[]) =>
      mutate(() => setUserTeamsRequest(orgUuid!, userId, teamUuids), "Teams updated"),
    [mutate, orgUuid],
  );

  /** Adds `userId` to the team. */
  const joinTeam = useCallback(
    (userId: string, teamUuid: string, teamName: string) =>
      mutate(() => addTeamMembers(orgUuid!, teamUuid, [userId]), `${nameOf(userId)} added to ${teamName}`),
    [mutate, orgUuid, nameOf],
  );

  return {
    index,
    isLoading,
    isMutating,
    reload,
    addManager,
    removeManager,
    removeLine,
    moveManager,
    setTeams,
    joinTeam,
  };
}
