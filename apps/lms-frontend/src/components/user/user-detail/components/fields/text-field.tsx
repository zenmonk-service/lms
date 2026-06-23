"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { EditUserFormData } from "../../user.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

export default function TextField({
  name,
  label,
  isEditing,
  placeholder = "NA",
}: {
  name: keyof EditUserFormData;
  label: string;
  isEditing: boolean;
  placeholder?: string;
}) {
  const { control } = useFormContext<EditUserFormData>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        return (
          <Field className="gap-1">
            <FieldLabel>{label}</FieldLabel>
            <Input
              ref={field.ref}
              name={field.name}
              disabled={!isEditing}
              onBlur={field.onBlur}
              onChange={field.onChange}
              placeholder={placeholder}
              value={(field.value as string)}
              className={`${!isEditing && "bg-muted font-medium"} placeholder:tracking-tighter placeholder:font-normal`}
            />
            <FieldError errors={[error]} className="text-xs" />
          </Field>
        );
      }}
    />
  );
}
