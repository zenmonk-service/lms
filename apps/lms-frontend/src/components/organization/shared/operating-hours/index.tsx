"use client";

import { OrgSettingsForm } from "@/components/organization/organization.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WorkDays } from "@/features/organizations/organizations.types";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

const workDays = [
  { label: "Sun", value: WorkDays.SUNDAY },
  { label: "Mon", value: WorkDays.MONDAY },
  { label: "Tue", value: WorkDays.TUESDAY },
  { label: "Wed", value: WorkDays.WEDNESDAY },
  { label: "Thu", value: WorkDays.THURSDAY },
  { label: "Fri", value: WorkDays.FRIDAY },
  { label: "Sat", value: WorkDays.SATURDAY },
];

const OperatingHours = () => {
  const { control } = useFormContext<OrgSettingsForm>();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Operating Hours</h1>
        <p className="text-sm text-muted-foreground">
          Configure the work week and standard daily shift timings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Controller
          name="work_days"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-2">
              <ToggleGroup
                type="multiple"
                variant="outline"
                size="lg"
                className="w-full justify-start"
                value={field.value}
                onValueChange={field.onChange}
              >
                <div className="flex flex-wrap gap-3">
                  {workDays.map((day) => (
                    <ToggleGroupItem
                      {...field}
                      key={day.value}
                      value={day.value}
                      aria-label={`Toggle ${day.label}`}
                      aria-invalid={fieldState.invalid}
                    >
                      {day.label}
                    </ToggleGroupItem>
                  ))}
                </div>
              </ToggleGroup>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} className="text-xs" />
              )}
            </Field>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Controller
            name="start_time"
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1">
                <FieldLabel>
                  Start time <span className="text-destructive">*</span>
                </FieldLabel>
                <InputGroup className="rounded-none border-0 border-b border-border shadow-none">
                  <InputGroupInput
                    {...field}
                    type="time"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    aria-invalid={fieldState.invalid}
                    className="font-semibold px-0"
                    
                  />
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                )}
              </Field>
            )}
          />

          <Controller
            name="end_time"
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1">
                <FieldLabel>
                  End time <span className="text-destructive">*</span>
                </FieldLabel>
                <InputGroup className="rounded-none border-0 border-b border-border shadow-none">
                  <InputGroupInput
                    {...field}
                    type="time"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    aria-invalid={fieldState.invalid}
                    className="font-semibold px-0"
                  />
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                )}
              </Field>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default OperatingHours;
