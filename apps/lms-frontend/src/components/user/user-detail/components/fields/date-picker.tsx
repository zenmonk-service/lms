"use client";

import { Controller, FieldPath, useFormContext } from "react-hook-form";
import type { EditUserFormData } from "../../user.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { DatePicker } from "@/components/ui/date-picker";

export default function DatePickerField({
  name,
  label,
  isEditing,
  placeholder = "NA",
  allowFutureDates = true,
}: {
  name: FieldPath<EditUserFormData>;
  label: string;
  isEditing: boolean;
  placeholder?: string;
  allowFutureDates?: boolean;
}) {
  const { control } = useFormContext<EditUserFormData>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const parsedDate =
          typeof field.value === "string" && !isNaN(new Date(field.value).getTime())
            ? new Date(field.value)
            : undefined;
        return (
          <Field className="gap-1">
            <FieldLabel>{label}</FieldLabel>
            <DatePicker
              allowFutureDates={allowFutureDates}
              disabled={!isEditing }
              placeholder={placeholder}
              date={parsedDate}
              setDate={(date) => field.onChange(date?.toString())}
              className={`${!isEditing && "bg-muted font-medium"} placeholder:tracking-tighter placeholder:font-normal w-full`}
            />
            <FieldError errors={[error]} className="text-xs" />
          </Field>
        );
      }}
    />
  );
}
