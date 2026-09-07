import { LeaveRequestFormData } from "@/components/leave/leave.types";
import { LeaveRange, LeaveRequestType } from "@/features/leave/leave.types";
import { getRequestEffectiveDaysAction } from "@/features/leave/get-request-effective-days/get-request-effective-days.action";
import {
  resetEffectiveDays,
  setEffectiveDays,
} from "@/features/leave/leave.slice";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

interface IProps {
  open: boolean;
}

const EffectiveDaysCard = ({ open }: IProps) => {
  const dispatch = useAppDispatch();
  const { watch } = useFormContext<LeaveRequestFormData>();
  const { requestEffectiveDays, effectiveDaysLoading } = useAppSelector(
    (state) => state.leaveSlice,
  );
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );

  const previousRequestRef = useRef<any>(null);

  const type = watch("type");
  const range = watch("range");
  const leaveTypeUuid = watch("leave_type_uuid");
  const dateRange = watch("date_range");

  const hasEffectiveDays =
    leaveTypeUuid !== "" &&
    dateRange.start_date !== "" &&
    dateRange.end_date !== "" &&
    type !== ("" as LeaveRequestType) &&
    range !== ("" as LeaveRange);

  useEffect(() => {
    if (!open) return;

    if (type === LeaveRequestType.HALF_DAY) {
      dispatch(setEffectiveDays("0.5"));
      return;
    }

    if (type === LeaveRequestType.SHORT_LEAVE) {
      dispatch(setEffectiveDays("0.25"));
      return;
    }

    const isRequestIncomplete =
      leaveTypeUuid === "" ||
      dateRange.start_date === "" ||
      dateRange.end_date === "" ||
      type === ("" as LeaveRequestType) ||
      range === ("" as LeaveRange);

    if (isRequestIncomplete) {
      dispatch(resetEffectiveDays());
      return;
    }
    previousRequestRef.current?.abort();
    const request = dispatch(
      getRequestEffectiveDaysAction({
        org_uuid,
        leave_type_uuid: leaveTypeUuid,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        type: type,
        range: range,
      }),
    );
    previousRequestRef.current = request;
  }, [
    open,
    leaveTypeUuid,
    dateRange.start_date,
    dateRange.end_date,
    type,
    range,
  ]);

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
        hasEffectiveDays
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-muted/30",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight">
            Effective Days
          </span>
          <span className="text-xs text-muted-foreground">
            Calculated from your selection
          </span>
        </div>
      </div>

      {effectiveDaysLoading ? (
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <span
          className={cn(
            "text-2xl font-semibold tabular-nums tracking-tight",
            hasEffectiveDays ? "text-primary" : "text-muted-foreground",
          )}
        >
          {requestEffectiveDays ?? 0}
        </span>
      )}
    </div>
  );
};

export default EffectiveDaysCard;
