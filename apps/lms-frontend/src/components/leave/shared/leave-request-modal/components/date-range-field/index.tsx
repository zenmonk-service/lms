import { LeaveRequestFormData } from "@/components/leave/leave.types";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { LeaveRequestType, Row } from "@/features/leave/leave.types";
import { DateRangePicker } from "@/shared/date-range-picker";
import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

interface IProps {
  data?: Row;
}

const DateRangeField = ({ data }: IProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<LeaveRequestFormData>();

  const type = watch("type");
  const leaveTypeUuid = watch("leave_type_uuid");

  return (
    <Controller
      name="date_range"
      control={control}
      render={({ field, fieldState }) => (
        <Field className="gap-1">
          <FieldLabel>
            Date Range <span className="text-destructive">*</span>
          </FieldLabel>
          <DateRangePicker
            type={type}
            maxDays={60}
            minDate={TODAY}
            ref={field.ref}
            disabled={
              type === ("" as LeaveRequestType) || leaveTypeUuid === ""
            }
            setDateRange={field.onChange}
            initialEndDate={data?.end_date}
            initialStartDate={data?.start_date}
            invalid={fieldState.invalid}
            className={cn(
              fieldState.invalid &&
                "border-destructive ring-destructive focus-visible:ring-destructive text-destructive",
            )}
          />
          <FieldError
            errors={[
              {
                message:
                  errors.date_range?.start_date?.message ||
                  errors.date_range?.end_date?.message ||
                  fieldState.error?.message,
              },
            ]}
            className="text-xs"
          />
        </Field>
      )}
    />
  );
};

export default DateRangeField;
