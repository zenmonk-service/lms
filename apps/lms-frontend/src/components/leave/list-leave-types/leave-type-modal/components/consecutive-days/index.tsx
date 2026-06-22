import { LeaveTypeFormData } from "@/components/leave/leave.types";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

const ConsecutiveDays = () => {
  const { control, setValue, watch } = useFormContext<LeaveTypeFormData>();
  const showConsecutiveDays = watch("showConsecutiveDays");

  return (
    <FieldLabel htmlFor="switch-consecutive-leaves">
      <Field orientation="horizontal">
        <FieldContent>
          <div className="flex gap-2">
            <div className="bg-muted p-2 rounded-lg h-fit">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <FieldTitle className="font-semibold">
                Limit Max Consecutive Days
              </FieldTitle>
              <FieldDescription className="text-muted-foreground text-xs ">
                Restricts the number of days taken in a single request.
              </FieldDescription>
              <Collapsible open={showConsecutiveDays}>
                <CollapsibleContent>
                  <Controller
                    name="max_consecutive_days"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field className="gap-1">
                        <div className="mt-4 flex items-center gap-2">
                          <Input
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value;

                              if (value === "") {
                                field.onChange("");
                                return;
                              }

                              if (/^[1-9]\d*$/.test(value)) {
                                field.onChange(value);
                              }
                            }}
                            className="bg-background px-3 py-1.5 text-xs w-24 outline-none focus:ring-1 focus:ring-primary"
                            id="max_consecutive_days"
                            placeholder="e.g. 10"
                            aria-invalid={!!fieldState.invalid}
                          />
                          <p className="text-muted-foreground text-xs">
                            days maximum per request
                          </p>
                        </div>
                        <FieldError errors={[fieldState.error]} className="text-xs"/>
                      </Field>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </FieldContent>
        <Controller
          name="showConsecutiveDays"
          control={control}
          render={({ field }) => (
            <Switch
              id="switch-consecutive-leaves"
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                if (!checked) {
                  setValue("max_consecutive_days", "");
                }
              }}
            />
          )}
        />
      </Field>
    </FieldLabel>
  );
};

export default ConsecutiveDays;
