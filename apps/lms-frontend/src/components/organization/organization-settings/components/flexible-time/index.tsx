import { OrgSettingsForm } from "@/components/organization/organization.types";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  TimePicker,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerMinute,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@/components/ui/time-picker";

export default function FlexibleTime() {
  const { control } = useFormContext<OrgSettingsForm>();

  return (
    <div className="flex justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold">Flexible Time</h1>
        <p className="text-xs text-muted-foreground">
          Allow employees to flexible working hours within the defined start and
          end time.
        </p>
      </div>
      <Controller
        name="flexible_time"
        control={control}
        render={({ field, fieldState }) => (
          <Field className="gap-1">
            <FieldLabel>Select time</FieldLabel>
            <TimePicker
              locale="en-GB"
              value={field.value ?? "00:00"}
              onValueChange={field.onChange}
            >
              <TimePickerInputGroup>
                <TimePickerInput segment="hour" />
                <TimePickerSeparator />
                <TimePickerInput segment="minute" />
                <TimePickerTrigger />
              </TimePickerInputGroup>
              <TimePickerContent>
                <TimePickerHour />
                <TimePickerMinute />
              </TimePickerContent>
            </TimePicker>
            <FieldDescription className="text-xs">
              Select the time when the flexible working hours start.
            </FieldDescription>
            <FieldError errors={[fieldState.error]} className="text-xs" />
          </Field>
        )}
      />
    </div>
  );
}
