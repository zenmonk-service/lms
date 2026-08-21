"use client";

import { Controller, FieldPath, useFormContext } from "react-hook-form";
import type { EditUserFormData } from "../../user.types";
import { Switch } from "@/components/ui/switch";

export default function SwitchField({
  name,
  isEditing,
}: {
  name: FieldPath<EditUserFormData>;
  isEditing: boolean;
}) {
  const { control } = useFormContext<EditUserFormData>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { invalid } }) => {
        return (
          <Switch
            checked={Boolean(field.value)}
            disabled={!isEditing}
            aria-invalid={invalid}
            onCheckedChange={field.onChange}
            className={`${!isEditing && "bg-muted font-medium"} placeholder:tracking-tighter placeholder:font-normal`}
          ></Switch>
        );
      }}
    />
  );
}
