"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useAppSelector } from "@/store";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { UserListPicker } from "@/components/team/pickers/user-picker";
import { TeamMultiPicker } from "@/components/team/pickers/team-multi-picker";
import type { EditUserFormData } from "../../user.types";
import SelectField from "../fields/select-field";
import TextField from "../fields/text-field";
import { Separator } from "@/components/ui/separator";
import { EmploymentType, WorkMode } from "@/features/user/user.type";

export default function EmploymentDetails({
  isEditing,
}: {
  isEditing: boolean;
}) {
  const roles = useAppSelector((state) => state.rolesSlice.roles);
  const shifts = useAppSelector((state) => state.shiftSlice.shifts);
  const selectedUser = useAppSelector((state) => state.userSlice.selectedUser);
  const { control } = useFormContext<EditUserFormData>();
  const teamManagers = (selectedUser?.managers ?? []).filter((manager) => manager.team);

  return (
    <div className="space-y-3">
      <div className="rounded-t-sm">
        <p className="font-semibold">Employment Details</p>
        <p className="text-sm text-muted-foreground">
          Workspace location permissions and employee classifications.
        </p>
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          name="role_uuid"
          label="Role"
          isEditing={isEditing}
          options={roles.map((r) => ({ value: r.uuid, label: r.name }))}
        />
        <SelectField
          name="shift_uuid"
          label="Shift"
          isEditing={isEditing}
          options={shifts.map((s) => ({ value: s.uuid, label: s.name }))}
        />
        <SelectField
          name="employment_type"
          label="Employment Type"
          isEditing={isEditing}
          options={Object.values(EmploymentType).map((type) => ({
            value: type,
            label: type.replaceAll("_", " ").slice(0, 1).toUpperCase() + type.replaceAll("_", " ").slice(1),
          }))}
        />
        <SelectField
          name="work_mode"
          label="Work Mode"
          isEditing={isEditing}
          options={Object.values(WorkMode).map((mode) => ({
            value: mode,
            label: mode.replace(/_/g, " ").slice(0, 1).toUpperCase() + mode.replace(/_/g, " ").slice(1),
          }))}
        />
        <Controller
          name="managers"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Field className="gap-1">
              <FieldLabel>Reports To</FieldLabel>
              <UserListPicker
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Add a manager"
                emptyLabel="—"
                excludeUserIds={selectedUser ? [selectedUser.user_id] : []}
                disabled={!isEditing}
              />
              {teamManagers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Within teams:{" "}
                  {teamManagers
                    .map((manager) => `${manager.name} (${manager.team!.name})`)
                    .join(", ")}
                  . Change these on Org Structure.
                </p>
              )}
              <FieldError errors={[error]} className="text-xs" />
            </Field>
          )}
        />
        <Controller
          name="team_uuids"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <Field className="gap-1">
              <FieldLabel>Teams</FieldLabel>
              <TeamMultiPicker
                value={field.value ?? []}
                onChange={field.onChange}
                disabled={!isEditing}
              />
              <FieldError errors={[error]} className="text-xs" />
            </Field>
          )}
        />
        <div className="sm:col-span-2">
          <TextField
            name="work_branch"
            label="Work Branch"
            placeholder="Enter work branch"
            isEditing={isEditing}
          />
        </div>
      </div>
    </div>
  );
}
