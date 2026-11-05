"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  createTeamAction,
  updateTeamAction,
} from "@/features/team/team.action";
import type { Team } from "@/features/team/team.type";
import type { UserOption } from "@/shared/hooks/use-user-options";
import { UserMultiPicker, UserPicker } from "../pickers/user-picker";

const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty("Team name is required")
    .max(60, "Team name must be at most 60 characters"),
  description: z
    .string()
    .trim()
    .max(200, "Description must be at most 200 characters")
    .optional(),
});

type FormData = z.infer<typeof teamSchema>;

/**
 * Create (no `team`) or edit (`team` given) dialog. On create, members can be
 * picked up front; on edit, membership is managed from the team detail sheet.
 */
export default function TeamFormDialog({
  open,
  onOpenChange,
  team,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team | null;
  onSaved: (teamUuid?: string) => void;
}) {
  const dispatch = useAppDispatch();
  const orgUuid = useAppSelector(
    (s) => s.organizationsSlice.currentOrganization?.uuid,
  );
  const isSaving = useAppSelector((s) => s.teamSlice.isSaving);
  const isEdit = !!team;

  const [lead, setLead] = useState<UserOption | null>(null);
  const [memberIds, setMemberIds] = useState<string[]>([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({ name: team?.name ?? "", description: team?.description ?? "" });
    setLead(
      team?.lead
        ? { user_id: team.lead.user_id, name: team.lead.name, email: team.lead.email }
        : null,
    );
    setMemberIds([]);
  }, [open, team, reset]);

  const descriptionValue = watch("description");

  const onSubmit = async (data: FormData) => {
    if (!orgUuid) return;
    const description = data.description ? data.description : null;
    try {
      if (isEdit) {
        const originalLead = team!.lead?.user_id ?? null;
        const nextLead = lead?.user_id ?? null;
        await dispatch(
          updateTeamAction({
            org_uuid: orgUuid,
            team_uuid: team!.uuid,
            name: data.name,
            description,
            ...(nextLead !== originalLead && { lead_uuid: nextLead }),
          }),
        ).unwrap();
        onSaved(team!.uuid);
      } else {
        const created = await dispatch(
          createTeamAction({
            org_uuid: orgUuid,
            name: data.name,
            description,
            lead_uuid: lead?.user_id ?? null,
            member_uuids: memberIds,
          }),
        ).unwrap();
        onSaved(created.uuid);
      }
      onOpenChange(false);
    } catch {
      // Error already toasted by the thunk; keep the dialog open.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Team" : "Create Team"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the team's name, description, or lead."
                : "Group people into a team and optionally pick a team lead."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Field className="gap-1">
              <FieldLabel htmlFor="team-name">
                Team Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...register("name")}
                id="team-name"
                placeholder="e.g. Platform Engineering"
                maxLength={60}
                aria-invalid={!!errors.name}
              />
              <FieldError errors={[errors.name]} className="text-xs" />
            </Field>

            <Field className="gap-1">
              <FieldLabel htmlFor="team-description">Description</FieldLabel>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="team-description"
                      placeholder="What does this team work on?"
                      rows={3}
                      maxLength={200}
                      className="min-h-16 max-h-32 resize-none"
                      aria-invalid={!!errors.description}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {descriptionValue?.length || 0}/200 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                )}
              />
              <FieldError errors={[errors.description]} className="text-xs" />
            </Field>

            <Field className="gap-1">
              <FieldLabel>Team Lead</FieldLabel>
              <UserPicker
                value={lead}
                onChange={setLead}
                placeholder="Select a team lead"
              />
              <p className="text-xs text-muted-foreground">
                The lead is added to the team automatically.
              </p>
            </Field>

            {!isEdit && (
              <Field className="gap-1">
                <FieldLabel>Members</FieldLabel>
                <UserMultiPicker
                  value={memberIds}
                  onChange={setMemberIds}
                  placeholder="Add members"
                  excludeUserIds={lead ? [lead.user_id] : []}
                />
              </Field>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <LoaderCircle className="animate-spin" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
