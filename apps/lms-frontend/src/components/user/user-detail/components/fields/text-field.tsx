"use client";

import { Controller, FieldPath, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { EditUserFormData } from "../../user.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

export default function TextField({
  name,
  label,
  isEditing,
  placeholder = "NA",
  digitsOnly = false,
}: {
  name: FieldPath<EditUserFormData>;
  label: string;
  isEditing: boolean;
  placeholder?: string;
  /** Strips anything but digits as it's typed or pasted — for phone fields. */
  digitsOnly?: boolean;
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
              inputMode={digitsOnly ? "numeric" : undefined}
              onBlur={field.onBlur}
              onChange={(e) => {
                const value = digitsOnly
                  ? e.target.value.replace(/\D/g, "")
                  : e.target.value;
                field.onChange(value);
              }}
              placeholder={placeholder}
              value={(field.value as string) || ""}
              className={`${!isEditing && "bg-muted font-medium"} placeholder:tracking-tighter placeholder:font-normal`}
            />
            <FieldError errors={[error]} className="text-xs" />
          </Field>
        );
      }}
    />
  );
}
