"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, LoaderCircle, Plus, Unlink, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/utils/get-initials";
import { toastError } from "@/shared/toast/toast-error";
import { UserPicker } from "@/components/team/pickers/user-picker";
import { TeamMultiPicker } from "@/components/team/pickers/team-multi-picker";
import type { UserOption } from "@/shared/hooks/use-user-options";
import { canReport, linesBetween, managersOf, type OrgIndex, type Person } from "./layout";

const NO_TEAM = "__none__";

interface IProps {
  person: Person;
  index: OrgIndex;
  orgUuid: string;
  editable: boolean;
  isMutating: boolean;
  onClose: () => void;
  onSelect: (userId: string) => void;
  addManager: (userId: string, managerId: string, teamUuid?: string | null) => Promise<boolean>;
  removeManager: (userId: string, managerId: string) => Promise<boolean>;
  removeLine: (userId: string, managerId: string, teamUuid: string | null) => Promise<boolean>;
  setTeams: (userId: string, teamUuids: string[]) => Promise<boolean>;
  /** Opens "Create user" with this person pre-filled as manager. */
  onAddNewReport?: () => void;
}

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

function Section({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {count !== undefined && <Badge variant="secondary">{count}</Badge>}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      {children}
    </section>
  );
}

export default function PersonPanel({
  person,
  index,
  orgUuid,
  editable,
  isMutating,
  onClose,
  onSelect,
  addManager,
  removeManager,
  removeLine,
  setTeams,
  onAddNewReport,
}: IProps) {
  const lines = index.managerLines.get(person.user_id) ?? [];
  const reportIds = index.reports.get(person.user_id) ?? [];
  const [newManager, setNewManager] = useState<UserOption | null>(null);
  const [newTeam, setNewTeam] = useState<string>(NO_TEAM);
  const savedTeams = person.teams.map((team) => team.uuid);
  const [teamDraft, setTeamDraft] = useState<string[]>(savedTeams);

  useEffect(() => {
    setTeamDraft(person.teams.map((team) => team.uuid));
    setNewManager(null);
    setNewTeam(NO_TEAM);
  }, [person]);

  const submitManager = async () => {
    if (!newManager) return;
    const managerId = newManager.user_id;
    const teamUuid = newTeam === NO_TEAM ? null : newTeam;
    if (!canReport(index, person.user_id, managerId)) {
      toastError(`${newManager.name} reports to ${person.name}, so they can't be their manager.`);
      return;
    }
    if (linesBetween(index, person.user_id, managerId).some((line) => (line.team?.uuid ?? null) === teamUuid)) {
      toastError(`${person.name} already reports to ${newManager.name}${teamUuid ? " in that team" : ""}.`);
      return;
    }
    if (await addManager(person.user_id, managerId, teamUuid)) {
      setNewManager(null);
      setNewTeam(NO_TEAM);
    }
  };

  const addReport = (userId: string) => {
    if (!canReport(index, userId, person.user_id)) {
      toastError(`${person.name} reports to ${index.people.get(userId)?.name ?? "them"}, so that would create a loop.`);
      return;
    }
    addManager(userId, person.user_id);
  };

  const teamChips = (teams: (string | undefined)[]) =>
    teams.filter(Boolean).map((name) => (
      <Badge key={name} variant="secondary" className="px-1.5 py-0 text-[10px]">
        {name}
      </Badge>
    ));

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border bg-background shadow-lg">
      <header className="flex items-start gap-3 p-4">
        <Avatar className="size-12 rounded-xl border">
          <AvatarImage src={person.image || ""} alt={person.name} className="object-cover" />
          <AvatarFallback className="rounded-xl">{getInitials(person.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{person.name}</p>
          <p className="truncate text-sm text-muted-foreground">{person.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {person.role && <Badge variant="outline">{person.role.name}</Badge>}
            {person.emp_code && <Badge variant="secondary">{person.emp_code}</Badge>}
            {!person.is_active && <Badge variant="destructive">Inactive</Badge>}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="-mr-2 -mt-2" onClick={onClose} aria-label="Close">
          <X className="size-4" />
        </Button>
      </header>

      <div className="px-4">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/${orgUuid}/user-management/${person.user_id}/details`}>
            Open profile <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        <Section title="Reports to" count={managersOf(index, person.user_id).length}>
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No manager (top-level)</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {lines.map((line) => {
                const manager = index.people.get(line.manager_id);
                if (!manager) return null;
                return (
                  <li key={`${line.manager_id}:${line.team?.uuid ?? ""}`} className="flex items-center gap-2 p-2">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() => onSelect(manager.user_id)}
                    >
                      <Avatar className="size-7 rounded-md border">
                        <AvatarImage src={manager.image || ""} alt={manager.name} />
                        <AvatarFallback className="rounded-md text-[10px]">{getInitials(manager.name)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium hover:underline">{manager.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {line.team ? `Within ${line.team.name}` : "Outside teams"}
                        </span>
                      </span>
                    </button>
                    {editable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={isMutating}
                        onClick={() => removeLine(person.user_id, line.manager_id, line.team?.uuid ?? null)}
                        title={`Stop reporting to ${manager.name}${line.team ? ` in ${line.team.name}` : ""}`}
                        aria-label={`Remove ${manager.name} as manager`}
                      >
                        <Unlink className="size-3.5" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {editable && (
            <div className="space-y-2 rounded-lg border border-dashed p-2">
              <UserPicker
                value={newManager}
                onChange={setNewManager}
                placeholder="Add a manager"
                excludeUserIds={[person.user_id]}
              />
              {newManager && (
                <div className="flex gap-2">
                  <Select value={newTeam} onValueChange={setNewTeam}>
                    <SelectTrigger className="h-8 flex-1 text-xs" aria-label="Applies within">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_TEAM}>Outside teams</SelectItem>
                      {person.teams.map((team) => (
                        <SelectItem key={team.uuid} value={team.uuid}>
                          Within {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-8" disabled={isMutating} onClick={submitManager}>
                    {isMutating ? <LoaderCircle className="animate-spin" /> : "Add"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Section>

        <Section title="Teams" count={person.teams.length}>
          <TeamMultiPicker value={teamDraft} onChange={setTeamDraft} disabled={!editable} placeholder="Not in a team" />
          {editable && !sameSet(teamDraft, savedTeams) && (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setTeamDraft(savedTeams)}>
                Reset
              </Button>
              <Button size="sm" disabled={isMutating} onClick={() => setTeams(person.user_id, teamDraft)}>
                {isMutating ? <LoaderCircle className="animate-spin" /> : "Save teams"}
              </Button>
            </div>
          )}
        </Section>

        <Section
          title="Direct reports"
          count={reportIds.length}
          action={
            onAddNewReport && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onAddNewReport}>
                <Plus className="size-3.5" /> New person
              </Button>
            )
          }
        >
          {editable && (
            <UserPicker
              value={null}
              onChange={(user) => user && addReport(user.user_id)}
              placeholder="Add an existing person"
              excludeUserIds={[person.user_id, ...reportIds]}
            />
          )}
          {reportIds.length === 0 ? (
            <p className="text-sm text-muted-foreground">No one reports to {person.name} yet.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {reportIds.map((id) => {
                const report = index.people.get(id);
                if (!report) return null;
                return (
                  <li key={id} className="flex items-center gap-2 p-2">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() => onSelect(id)}
                    >
                      <Avatar className="size-7 rounded-md border">
                        <AvatarImage src={report.image || ""} alt={report.name} />
                        <AvatarFallback className="rounded-md text-[10px]">{getInitials(report.name)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium hover:underline">{report.name}</span>
                        <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                          {report.role?.name ?? report.email}
                          {teamChips(linesBetween(index, id, person.user_id).map((line) => line.team?.name))}
                        </span>
                      </span>
                    </button>
                    {editable && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={isMutating}
                        onClick={() => removeManager(id, person.user_id)}
                        title={`Remove ${report.name} from ${person.name}'s reports`}
                        aria-label={`Remove ${report.name} from reports`}
                      >
                        <Unlink className="size-3.5" />
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>
    </aside>
  );
}
