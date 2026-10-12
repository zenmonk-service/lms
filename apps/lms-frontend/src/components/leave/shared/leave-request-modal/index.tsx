
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
import { useEffect, useState } from "react";
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
import { Period } from "@/lib/period";

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosingAfterSubmit, setIsClosingAfterSubmit] =
    useState(false);

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

  const isBusy =
    isSubmitting ||
    leaveRequestsLoading ||
    effectiveDaysLoading;

  useEffect(() => {
    if (!open) return;

    const period = Period.getCurrentPeriod();

    dispatch(
      listLeaveTypesAction({
        org_uuid,
        params: {
          user_uuid: currentUser.user_id,
          role_uuid: currentUser.role.uuid!,
          period: period,
          is_sealed: false,
        },
        is_filter: "true",
      }),
    );
  }, [org_uuid, open, currentUser.user_id, currentUser.role.uuid, dispatch]);

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
    if (open) dispatch(resetEffectiveDays());
  }, [open, data]);

  const onSubmit = async (formValues: LeaveRequestFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...formValues,
        ...formValues.date_range,
      };

      if (leave_request_uuid) {
        await dispatch(
          updateUserLeaveRequestAction({
            org_uuid,
            user_uuid: currentUser.user_id,
            leave_request_uuid,
            ...payload,
          }),
        ).unwrap();
      } else {
        await dispatch(
          createUserLeaveRequestAction({
            org_uuid,
            user_uuid: currentUser.user_id,
            ...payload,
          }),
        ).unwrap();
      }

      await dispatch(
        listUserLeaveRequestsAction({
          org_uuid,
          user_uuid: currentUser.user_id,
        }),
      ).unwrap();

      // Keep the loading state active during the exit animation.
      setIsClosingAfterSubmit(true);
      onClose();
    } catch (error) {
      console.error("Failed to submit leave request:", error);
      setIsSubmitting(false);
      setIsClosingAfterSubmit(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    // Prevent the user from dismissing the modal while submitting.
    if (!nextOpen && isSubmitting) return;

    onOpenChange(nextOpen);
  };

  const handleExitAnimationEnd = (
    event: React.AnimationEvent<HTMLDivElement>,
  ) => {
    // Ignore animations from nested elements.
    if (event.target !== event.currentTarget) return;

    if (!open && isClosingAfterSubmit) {
      setIsSubmitting(false);
      setIsClosingAfterSubmit(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-full overflow-x-hidden sm:max-w-150 lg:max-w-175"
        onAnimationEnd={handleExitAnimationEnd}
      >
        <FormProvider {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full min-w-0"
          >
            <DialogHeader>
              <DialogTitle>Request Leave</DialogTitle>
              <DialogDescription>
                Fill in the form below to request leave.
              </DialogDescription>
            </DialogHeader>

            <div className="w-full min-w-0 space-y-4 overflow-y-auto py-2 no-scrollbar max-h-96 sm:max-h-140">
              <LeaveTypeField />
              <DurationField open={open} />
              <DateRangeField data={data} />
              <EffectiveDaysCard open={open} />
              <ManagersField
                open={open}
                existingManagers={data?.managers}
              />
              <AttachmentsField />
              <ReasonField />
            </div>

            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  disabled={isBusy}
                  variant="outline"
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit" disabled={isBusy}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    {isClosingAfterSubmit
                      ? "Closing..."
                      : "Submitting..."}
                  </>
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
