"use client";

import { useState } from "react";
import { Network, UsersRound } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Title from "@/shared/typography/title";
import NoPermission from "@/shared/no-permission";
import { usePermissionCheck } from "@/hooks/use-permission-check";
import {
  PermissionAction,
  PermissionTag,
} from "@/features/permissions/permission.type";
import ListTeamManagement from "@/components/team/list-team";
import OrgCanvas from "./canvas/org-canvas";

export default function OrgStructure() {
  const can = usePermissionCheck();
  const canReadPeople = can(PermissionTag.USER_MANAGEMENT, PermissionAction.READ);
  const canEditPeople = can(PermissionTag.USER_MANAGEMENT, PermissionAction.UPDATE);
  const canCreatePeople = can(PermissionTag.USER_MANAGEMENT, PermissionAction.CREATE);
  const canReadTeams = can(PermissionTag.TEAM_MANAGEMENT, PermissionAction.READ);
  const canEditTeams = can(PermissionTag.TEAM_MANAGEMENT, PermissionAction.UPDATE);
  const canCreateTeams = can(PermissionTag.TEAM_MANAGEMENT, PermissionAction.CREATE);
  const [view, setView] = useState(canReadPeople ? "hierarchy" : "teams");
  const [highlightTeam, setHighlightTeam] = useState<string | undefined>();

  if (!canReadPeople && !canReadTeams) {
    return <NoPermission moduleName="Org Structure" />;
  }

  return (
    <Tabs value={view} onValueChange={setView} className="gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Title
          title={{ text: "Org Structure" }}
          description={{
            text:
              view === "hierarchy"
                ? "Move cards freely; drop one on someone to change who they report to. Select a line to remove it."
                : "Group people into teams and assign team leads.",
          }}
        />
        <TabsList>
          {canReadPeople && (
            <TabsTrigger value="hierarchy">
              <Network className="size-4" /> Hierarchy
            </TabsTrigger>
          )}
          {canReadTeams && (
            <TabsTrigger value="teams">
              <UsersRound className="size-4" /> Teams
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      {canReadPeople && (
        <TabsContent value="hierarchy">
          <OrgCanvas
            editable={canEditPeople}
            canCreate={canCreatePeople}
            canReadTeams={canReadTeams}
            canEditTeams={canEditTeams}
            canCreateTeams={canCreateTeams}
            highlightTeam={highlightTeam}
            onHighlightTeamChange={setHighlightTeam}
          />
        </TabsContent>
      )}
      {canReadTeams && (
        <TabsContent value="teams">
          <ListTeamManagement
            canCreatePeople={canCreatePeople}
            onShowOnCanvas={
              canReadPeople
                ? (teamUuid) => {
                    setHighlightTeam(teamUuid);
                    setView("hierarchy");
                  }
                : undefined
            }
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
