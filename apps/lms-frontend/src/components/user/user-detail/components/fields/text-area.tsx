"use client";

import { Controller, FieldPath, useFormContext } from "react-hook-form";
import type { EditUserFormData } from "../../user.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export default function TextArea({
  name,
  label,
  isEditing,
  placeholder = "NA",
}: {
  name: FieldPath<EditUserFormData>;
  label: string;
  isEditing: boolean;
  placeholder?: string;
}) {
  const { control } = useFormContext<EditUserFormData>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error, invalid } }) => {
        return (
          <Field className="gap-1">
            <FieldLabel>{label}</FieldLabel>
            <Textarea
              maxLength={255}
              value={field.value as string || ""}
              disabled={!isEditing}
              aria-invalid={invalid}
              placeholder={placeholder}
              onChange={field.onChange}
              className={`${!isEditing && "bg-muted font-medium"} placeholder:tracking-tighter placeholder:font-normal max-h-50 overflow-y-auto`}
            />
            <FieldError errors={[error]} className="text-xs" />
          </Field>
        );
      }}
    />
  );
}
