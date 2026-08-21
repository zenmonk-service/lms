import { TimePicker } from "@/components/event-management/components/date-picker";
import { OrgSettingsForm } from "@/components/organization/organization.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import Collapse from "@/shared/motion/collapse";
import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { createTimeDate } from "../..";

export default function FlexibleTime() {
  const { control } = useFormContext<OrgSettingsForm>();
  const isApplicable = useWatch({
    control,
    name: "flexible_time",
  });

  return (
    <div className="col-span-1 sm:col-span-2">
      <div className="flex-1 flex justify-between gap-4">
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Flexible Time</h1>
          </div>

          <p className="text-xs text-muted-foreground">
            Allow employees to flexible working hours within the defined start
            and end time.
          </p>
        </div>
        <div>
          <Controller
            name="flexible_time"
            control={control}
            render={({ field }) => (
              <Switch
                id="switch-flexible-time"
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    field.onChange(null);
                    return;
                  }
                  field.onChange(createTimeDate());
                }}
              />
            )}
          />
        </div>
      </div>
      <Collapse open={Boolean(isApplicable)}>
        <div>
          <Controller
            name="flexible_time"
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1">
                <FieldLabel className="flex items-center justify-between"></FieldLabel>
                <div className="mt-4">
                  <TimePicker
                    date={field.value}
                    hourCycle={24}
                    granularity="minute"
                    onChange={field.onChange}
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} className="text-xs" />
                )}
              </Field>
            )}
          />
        </div>
      </Collapse>
    </div>
  );
}
