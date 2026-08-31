"use client";

import { Controller, FieldPath, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { EditUserFormData } from "../../user.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

export default function NumberField({
  name,
  label,
  isEditing,
  placeholder = "NA",
  maxValue,
}: {
  name: FieldPath<EditUserFormData>;
  label: string;
  isEditing: boolean;
  placeholder?: string;
  maxValue?: number;
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
              max={maxValue}
              min={0}
              type="number"
              disabled={!isEditing}
              onBlur={field.onBlur}
              onChange={(e) => field.onChange(Number(e.target.value))}
              placeholder={placeholder}
              value={(field.value as number) || ""}
              className={`${!isEditing && "bg-muted font-medium"} placeholder:tracking-tighter placeholder:font-normal`}
            />
            <FieldError errors={[error]} className="text-xs" />
          </Field>
        );
      }}
    />
  );
}
