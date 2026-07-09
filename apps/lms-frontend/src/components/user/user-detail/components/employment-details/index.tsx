"use client";

import { useAppSelector } from "@/store";
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
            label: mode.slice(0, 1).toUpperCase() + mode.slice(1),
          }))}
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
