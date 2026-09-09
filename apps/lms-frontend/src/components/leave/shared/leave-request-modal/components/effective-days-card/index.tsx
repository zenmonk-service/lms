import { LeaveRequestFormData } from "@/components/leave/leave.types";
import { LeaveRange, LeaveRequestType } from "@/features/leave/leave.types";
import { getRequestEffectiveDaysAction } from "@/features/leave/get-request-effective-days/get-request-effective-days.action";
import {
  resetEffectiveDays,
  setEffectiveDays,
} from "@/features/leave/leave.slice";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";

interface IProps {
  open: boolean;
}

const PAST_DATED_MULTIPLIER = 2;

const getTodayString = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const EffectiveDaysCard = ({ open }: IProps) => {
  const dispatch = useAppDispatch();
  const { watch } = useFormContext<LeaveRequestFormData>();
  const { requestEffectiveDays, effectiveDaysLoading } = useAppSelector((state) => state.leaveSlice);
  const org_uuid = useAppSelector((state) => state.organizationsSlice.currentOrganization.uuid);
  const pastDatedLeaveBalance = useAppSelector((state) => state.userSlice.currentUser?.past_dated_leave_balance);

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

  const baseDays = Number(requestEffectiveDays ?? 0);
  const startsToday = dateRange.start_date === getTodayString();
  const hasNoPastDatedBalance =
    pastDatedLeaveBalance != null && Number(pastDatedLeaveBalance) === 0;
  const isDoubleCharged =
    hasEffectiveDays && startsToday && hasNoPastDatedBalance && baseDays > 0;
  const totalDays = isDoubleCharged
    ? baseDays * PAST_DATED_MULTIPLIER
    : baseDays;

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 transition-colors",
        isDoubleCharged
          ? "border-destructive/30 bg-destructive/5"
          : hasEffectiveDays
            ? "border-primary/20 bg-primary/5"
            : "border-border bg-muted/30",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-tight">
            Effective Days
          </span>
          <span className="text-xs text-muted-foreground">
            Calculated from your selection
          </span>
        </div>

        {effectiveDaysLoading ? (
          <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
        ) : isDoubleCharged ? (
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-base font-medium text-muted-foreground line-through">
              {baseDays}
            </span>
            <span className="text-sm font-semibold text-destructive">
              &times; {PAST_DATED_MULTIPLIER}
            </span>
            <span className="text-sm text-muted-foreground">=</span>
            <span className="text-2xl font-semibold tracking-tight text-destructive">
              {totalDays}
            </span>
          </div>
        ) : (
          <span
            className={cn(
              "text-2xl font-semibold tabular-nums tracking-tight",
              hasEffectiveDays ? "text-primary" : "text-muted-foreground",
            )}
          >
            {totalDays}
          </span>
        )}
      </div>

      {isDoubleCharged && (
        <div className="mt-2.5 flex items-center gap-2 border-t border-destructive/20 pt-2.5">
          <TriangleAlert className="size-3.5 shrink-0 text-destructive" />
          <p className="text-xs text-destructive/90">
            No post-dated leave balance left &mdash; a leave starting today is
            charged at <span className="font-semibold">2&times;</span>.{" "}
            {baseDays} {baseDays === 1 ? "day" : "days"} becomes{" "}
            <span className="font-semibold">{totalDays}</span>.
          </p>
        </div>
      )}
    </div>
  );
};

export default EffectiveDaysCard;
