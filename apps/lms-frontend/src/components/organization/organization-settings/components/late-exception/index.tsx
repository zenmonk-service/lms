"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrgSettingsForm } from "@/components/organization/organization.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import Collapse from "@/shared/motion/collapse";
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

export default function LateExceptionSettings() {
  const { control } = useFormContext<OrgSettingsForm>();
  const isLateExceptionApplicable = useWatch({ control, name: "late_exception.is_applicable" });
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">Late Exceptions</h1>
          <p className="text-sm text-muted-foreground">
            Manage your workspace details and settings for late exceptions.
          </p>
        </div>
        <Controller
          name="late_exception.is_applicable"
          control={control}
          render={({ field }) => (
            <Switch
              id="switch-late-exception"
              checked={field.value}
              onCheckedChange={(val) => {
                field.onChange(val);
              }}
            />
          )}
        />
      </div>

      <Collapse open={isLateExceptionApplicable}>
        <div className="flex gap-6 justify-center sm:flex-row flex-col mt-4">
          <Controller
            control={control}
            name="late_exception.tenure"
            render={({ field, fieldState }) => (
              <Field className=" gap-1 w-full">
                <FieldLabel>Tenure <span className="text-destructive">*</span></FieldLabel>
                <Select
                  key={field.value}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    className="border-0 border-b border-border rounded-none shadow-none w-full"
                    value={field.value}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs">
                        Tenure
                      </SelectLabel>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">
                        Quarterly
                      </SelectItem>
                      <SelectItem value="half_yearly">
                        Half Yearly
                      </SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError
                  errors={[fieldState.error]}
                  className="text-xs"
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="late_exception.balance"
            render={({ field, fieldState }) => {
              return (
                <Field className="gap-1">
                  <FieldLabel className="text-sm font-medium">
                    Maximum Allowed Late Exceptions{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>

                  <Input
                    type="number"
                    min={0}
                    placeholder="Enter limit"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={[fieldState.error]}
                    className="text-xs ml-3"
                  />
                </Field>
              );
            }}
          />

          <Controller
            control={control}
            name="late_exception.time"
            render={({ field, fieldState }) => {
              return (
                <Field className="gap-1">
                  <FieldLabel>
                    Maximum Allowed Late time{" "}
                  </FieldLabel>
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

                  <FieldError errors={[fieldState.error]} className="text-xs" />
                </Field>
              );
            }}
          />
        </div>
      </Collapse>
    </div>
  );
}
