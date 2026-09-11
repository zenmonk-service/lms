import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { LoaderCircle } from "lucide-react";
import { listUserLeaveRequestsAction } from "@/features/leave/list-user-leave-requests/list-user-leave-requests.action";
import { createUserLeaveRequestAction } from "@/features/leave/create-user-leave-request/create-user-leave-request.action";
import { updateUserLeaveRequestAction } from "@/features/leave/update-user-leave-request/update-user-leave-request.action";
import { LeaveRange, LeaveRequestType, Managers, Row } from "@/features/leave/leave.types";
import { LeaveRequestFormData, leaveRequestSchema } from "../../leave.types";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";
import { resetEffectiveDays } from "@/features/leave/leave.slice";
import LeaveTypeField from "./components/leave-type-field";
import DurationField from "./components/duration-field";
import DateRangeField from "./components/date-range-field";
import EffectiveDaysCard from "./components/effective-days-card";
import ManagersField from "./components/managers-field";
import AttachmentsField from "./components/attachments-field";
import ReasonField from "./components/reason-field";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  data?: Row;
  leave_request_uuid?: string;
}

export function LeaveRequestModal({
  open,
  onOpenChange,
  onClose,
  data,
  leave_request_uuid,
}: IProps) {
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const { leaveRequestsLoading, effectiveDaysLoading } = useAppSelector(
    (state) => state.leaveSlice,
  );
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization.uuid,
  );

  const dispatch = useAppDispatch();

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leave_type_uuid: "",
      reason: "",
      managers: [],
      date_range: { start_date: "", end_date: "" },
      type: "" as LeaveRequestType,
      range: "" as LeaveRange,
      documents: [],
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (!open) return;
    const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    dispatch(
      listLeaveTypesAction({
        org_uuid,
        params: {
          user_uuid: currentUser.user_id,
          role_uuid: currentUser.role.uuid!,
          period: period,
          is_sealed: false,
        },
      }),
    );
  }, [org_uuid, open]);

  useEffect(() => {
    if (open) {
      reset({
        leave_type_uuid: data?.leave_type?.uuid ?? "",
        type: data?.type ?? ("" as LeaveRequestType),
        range: data?.range ?? ("" as LeaveRange),
        managers: (data?.managers || []).map((m: Managers) => m.user.user_id),
        reason: data?.reason ?? "",
        date_range: {
          start_date: data?.start_date ?? "",
          end_date: data?.end_date ?? "",
        },
        documents: data?.documents ?? [],
      });
    }
    if (!open) dispatch(resetEffectiveDays());
  }, [open, data]);

  const onSubmit = async (formValues: LeaveRequestFormData) => {
    const payload = { ...formValues, ...formValues.date_range };
    if (leave_request_uuid) {
      await dispatch(
        updateUserLeaveRequestAction({
          org_uuid,
          user_uuid: currentUser.user_id,
          leave_request_uuid,
          ...payload,
        }),
      );
    } else {
      await dispatch(
        createUserLeaveRequestAction({
          org_uuid,
          user_uuid: currentUser.user_id,
          ...payload,
        }),
      );
    }

    await dispatch(
      listUserLeaveRequestsAction({
        org_uuid,
        user_uuid: currentUser.user_id,
      }),
    );

    reset();
    dispatch(resetEffectiveDays());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-150 lg:max-w-175 overflow-x-hidden">
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full min-w-0">
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>
                Fill in the form below to request leave.
              </DialogDescription>
            </DialogHeader>

            <div className="w-full min-w-0 py-2 max-h-96 sm:max-h-140 overflow-y-auto no-scrollbar space-y-4">
              <LeaveTypeField />
              <DurationField open={open} />
              <DateRangeField data={data} />
              <EffectiveDaysCard open={open} />
              <ManagersField open={open} existingManagers={data?.managers} />
              <AttachmentsField />
              <ReasonField />
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button disabled={leaveRequestsLoading} variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={leaveRequestsLoading || effectiveDaysLoading}
              >
                {leaveRequestsLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Request Leave"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
