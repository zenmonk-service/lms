"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WorkDays } from "@/features/organizations/organizations.type";
import { Plus, Trash2 } from "lucide-react";
import { Control, Controller, useFieldArray } from "react-hook-form";

const workDays = [
  { label: "Sun", value: WorkDays.SUNDAY },
  { label: "Mon", value: WorkDays.MONDAY },
  { label: "Tue", value: WorkDays.TUESDAY },
  { label: "Wed", value: WorkDays.WEDNESDAY },
  { label: "Thu", value: WorkDays.THURSDAY },
  { label: "Fri", value: WorkDays.FRIDAY },
  { label: "Sat", value: WorkDays.SATURDAY },
];

interface OperatingHoursProps {
  control: Control<any>;
}

const OperatingHours = ({ control }: OperatingHoursProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "shifts",
  });

  const addShift = () => {
    append({
      name: "",
      start_time: "",
      end_time: "",
      flexible_time: "",
      effective_hours: 0,
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Operating Hours</h1>
        <p className="text-sm text-muted-foreground">
          Configure the work week and standard daily shift timings.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Controller
          name="work_days"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="gap-2">
              <ToggleGroup
                type="multiple"
                variant="outline"
                size="lg"
                value={field.value}
                onValueChange={field.onChange}
                className="items-start justify-start"
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
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl">Shift Management</h2>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={addShift}
          >
            <Plus /> Add Shift
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Controller
                name={`shifts.${index}.name`}
                control={control}
                render={({ field, fieldState }) => (
                  <Field className="gap-1 flex-1">
                    <InputGroup className="rounded-none border-0 border-b border-border shadow-none">
                      <InputGroupInput
                        {...field}
                        type="text"
                        placeholder="Shift name (e.g., Morning Shift)"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        aria-invalid={fieldState.invalid}
                        className="font-semibold px-0"
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs"
                      />
                    )}
                  </Field>
                )}
              />
              {fields.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => remove(index)}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>

            <div className="flex gap-6">
              <div className="flex-1">
                <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Start time
                </h2>
                <Controller
                  name={`shifts.${index}.start_time`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
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
                        <FieldError
                          errors={[fieldState.error]}
                          className="text-xs"
                        />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  End time
                </h2>
                <Controller
                  name={`shifts.${index}.end_time`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
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
                        <FieldError
                          errors={[fieldState.error]}
                          className="text-xs"
                        />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Flexible time
                </h2>
                <Controller
                  name={`shifts.${index}.flexible_time`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
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
                        <FieldError
                          errors={[fieldState.error]}
                          className="text-xs"
                        />
                      )}
                    </Field>
                  )}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                  Effective hours
                </h2>
                <Controller
                  name={`shifts.${index}.effective_hours`}
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field className="gap-1">
                      <InputGroup className="rounded-none border-0 border-b border-border shadow-none">
                        <InputGroupInput
                          {...field}
                          type="number"
                          value={Number(field.value)}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          aria-invalid={fieldState.invalid}
                          className="font-semibold px-0"
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className="text-xs"
                        />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperatingHours;
