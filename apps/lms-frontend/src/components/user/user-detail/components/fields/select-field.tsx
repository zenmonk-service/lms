"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { EditUserFormData } from "../../user.types";
import { FieldPath } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

export default function SelectField({
  name,
  label,
  isEditing,
  options,
  placeholder = "Select an option",
}: {
  name: FieldPath<EditUserFormData>;
  label: string;
  isEditing: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const { control } = useFormContext<EditUserFormData>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Field className="gap-1">
          <FieldLabel>{label}</FieldLabel>

          <Select
            value={(field.value as string) ?? ""}
            onValueChange={field.onChange}
            disabled={!isEditing}
          >
            <SelectTrigger
              ref={field.ref}
              onBlur={field.onBlur}
              className={`${!isEditing && "bg-muted font-medium"} w-full`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="capitalize">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldError errors={[error]} className="text-xs" />
        </Field>
      )}
    />
  );
}