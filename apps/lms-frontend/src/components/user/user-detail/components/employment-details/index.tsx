"use client";

import { useAppSelector } from "@/store";
import SelectField from "../fields/select-field";
import TextField from "../fields/text-field";
import { Separator } from "@/components/ui/separator";

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
          name="role"
          label="Role"
          isEditing={isEditing}
          options={roles.map((r) => ({ value: r.uuid, label: r.name }))}
        />
        <SelectField
          name="shift"
          label="Shift"
          isEditing={isEditing}
          options={shifts.map((s) => ({ value: s.uuid, label: s.name }))}
        />
        <SelectField
          name="employment_type"
          label="Employment Type"
          isEditing={isEditing}
          options={[
            { value: "full_time", label: "Full Time" },
            { value: "intern", label: "Intern" },
            { value: "contract", label: "Contract" },
          ]}
        />
        <SelectField
          name="work_mode"
          label="Work Mode"
          isEditing={isEditing}
          options={[
            { value: "office", label: "Office" },
            { value: "remote", label: "Remote" },
            { value: "hybrid", label: "Hybrid" },
          ]}
        />
        <TextField
          name="work_branch"
          label="Work Branch"
          placeholder="Enter work branch"
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}
