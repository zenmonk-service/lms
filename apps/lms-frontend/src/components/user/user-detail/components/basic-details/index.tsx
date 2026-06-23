"use client";

import { Separator } from "@/components/ui/separator";
import TextField from "../fields/text-field";
import SelectField from "../fields/select-field";

export default function BasicDetails({ isEditing }: { isEditing: boolean }) {
  return (
    <div className="space-y-3">
      <div className="rounded-t-sm">
        <p className="font-semibold">Basic Details</p>
        <p className="text-sm text-muted-foreground">
          Update workspace identification and fundamental profile records.
        </p>
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          name="name"
          label="Name"
          placeholder="Enter employee name"
          isEditing={isEditing}
        />
        <TextField
          name="email"
          label="Email"
          placeholder="Enter email address"
          isEditing={isEditing}
        />
        <SelectField
          name="marital_status"
          label="Marital Status"
          isEditing={isEditing}
          options={[
            { value: "single", label: "Single" },
            { value: "married", label: "Married" },
            { value: "divorced", label: "Divorced" },
            { value: "widowed", label: "Widowed" },
          ]}
        />
      </div>
    </div>
  );
}
