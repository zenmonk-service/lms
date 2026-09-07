import { LeaveRequestFormData } from "@/components/leave/leave.types";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { LeaveRange, LeaveRequestType } from "@/features/leave/leave.types";
import { useAppSelector } from "@/store";
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { DurationSelect } from "../../duration-select";

interface IProps {
  open: boolean;
}

const DurationField = ({ open }: IProps) => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LeaveRequestFormData>();
  const { leaveTypes } = useAppSelector((state) => state.leaveSlice);

  const type = watch("type");
  const range = watch("range");
  const leaveTypeUuid = watch("leave_type_uuid");

  const selectedLeaveType = useMemo(
    () => leaveTypes.find((lt) => lt.uuid === leaveTypeUuid),
    [leaveTypes, leaveTypeUuid],
  );
  const isFullDayOnly = !!selectedLeaveType?.is_full_day_only;

  // A full-day-only leave type forces the duration to Full Day.
  useEffect(() => {
    if (!open || !isFullDayOnly) return;
    if (type !== LeaveRequestType.FULL_DAY) {
      setValue("type", LeaveRequestType.FULL_DAY, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    if (range !== LeaveRange.FULL_DAY) {
      setValue("range", LeaveRange.FULL_DAY, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [open, isFullDayOnly, type, range, setValue]);

  return (
    <Field className="gap-1">
      <FieldLabel>
        Duration <span className="text-destructive">*</span>
      </FieldLabel>
      <DurationSelect
        type={type}
        range={range}
        disabled={isFullDayOnly}
        invalid={!!errors.type || !!errors.range}
        onChange={(nextType, nextRange) => {
          setValue("type", nextType, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          setValue("range", nextRange, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }}
      />
      {isFullDayOnly && (
        <FieldDescription className="text-xs">
          &ldquo;{selectedLeaveType?.name}&rdquo; can only be taken as a full
          day, so the duration is fixed.
        </FieldDescription>
      )}
      <FieldError
        errors={[{ message: errors.type?.message || errors.range?.message }]}
        className="text-xs"
      />
    </Field>
  );
};

export default DurationField;
