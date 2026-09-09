import { LeaveTypeFormData } from "@/components/leave/leave.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tenureOptions } from "@/components/organization/shared/late-exception";
import { LeaveApplicableOn } from "@/features/leave/leave.types";
import CustomSelect from "@/shared/select";
import { CalendarClock } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

const LeaveAccrual = () => {
  const { control, watch } = useFormContext<LeaveTypeFormData>();

  const accrualFrequency = watch("period");
  const leaveCount = watch("leave_count");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-muted p-2 rounded-lg shrink-0">
          <CalendarClock className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <p className="text-sm">Leave Accrual</p>
          <p className="text-xs text-muted-foreground">
            Configure how leave is accrued. You can choose to grant leave
            upfront or accrue it over time. These settings can&apos;t be changed
            once the leave type is created.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Controller
          name="period"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>
                Period <span className="text-destructive">*</span>
              </FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className="w-full"
                  aria-invalid={!!fieldState.error}
                >
                  <SelectValue placeholder="Accrual" />
                </SelectTrigger>
                <SelectContent>
                  {tenureOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} className="text-xs" />
            </Field>
          )}
        />
        <Controller
          name="leave_count"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>
                Leave count <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    field.onChange("");
                    return;
                  }

                  if (/^[0-9]*\.?[0-9]*$/.test(value)) {
                    field.onChange(value);
                  }
                }}
                id="leaveCount"
                placeholder="Leave count (e.g. 2.5)"
                aria-invalid={!!fieldState.error}
              />

              <FieldError
                errors={[fieldState.error]}
                className="text-xs whitespace-normal"
              />
              {!fieldState.error && (
                <p className="text-xs text-balance text-primary font-medium tracking-tight">
                  {leaveCount &&
                    (accrualFrequency && accrualFrequency !== "none"
                      ? `${leaveCount} days per ${accrualFrequency} (accrued)`
                      : `${leaveCount} days granted upfront`)}
                </p>
              )}
            </Field>
          )}
        />
        <Controller
          name="applicable_on"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-1">
              <FieldLabel>
                Applicable on <span className="text-destructive">*</span>
              </FieldLabel>
              <CustomSelect
                value={field.value}
                onValueChange={field.onChange}
                data={Object.values(LeaveApplicableOn)}
                getValue={(item) => item}
                getLabel={(item) =>
                  item.slice(0, 1).toUpperCase() +
                  item.replaceAll("_", " ").slice(1)
                }
                aria-invalid={!!fieldState.error}
                label="Applicable on"
                defaultValue={LeaveApplicableOn.START_OF_MONTH}
                className="w-full"
              />
              <FieldError errors={[fieldState.error]} className="text-xs" />
            </Field>
          )}
        />
      </div>
    </div>
  );
};

export default LeaveAccrual;
