"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store";
import { allocateSpecialLeaveAction } from "@/features/leave/allocate-special-leave/allocate-special-leave.action";
import { SlaFormValues, slaSchema } from "@/components/leave/leave.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { DialogClose } from "@radix-ui/react-dialog";
import { listLeaveTypesAction } from "@/features/leave/list-leave-types/list-leave-types.action";

interface ProvideSlaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUserUuid: string;
  period: string;
  onResolve?: () => Promise<void>;
  onClose?: () => void;
  /** Pre-selects a leave type, e.g. when opened from a specific leave balance row. */
  defaultLeaveTypeUuid?: string;
}
export function ProvideSlaModal({
  open,
  onOpenChange,
  selectedUserUuid,
  onClose,
  onResolve,
  period,
  defaultLeaveTypeUuid,
}: ProvideSlaModalProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const org_uuid = useAppSelector((state) => state.organizationsSlice.currentOrganization?.uuid);
  const { userLeaveTypes, leaveTypesLoading } = useAppSelector((state) => state.leaveSlice);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserLeaves = async () => {
    await dispatch(
      listLeaveTypesAction({
        org_uuid,
        params: {
          user_uuid: selectedUserUuid,
          role_uuid: currentUser.role.uuid!,
          period,
          is_sealed: false,
        },
        is_filter: "true",
      }),
    );
  };

  useEffect(() => {
    if (open && org_uuid && selectedUserUuid) fetchUserLeaves();
  }, [open, org_uuid, selectedUserUuid]);

  const getExistingSla = (leave_type_uuid: string) => {
    const leaveType = userLeaveTypes?.find((lt) => lt.uuid === leave_type_uuid);
    return Number(leaveType?.leave_balances?.[0]?.sla ?? 0);
  };

  const { handleSubmit, reset, control, setValue, watch } = useForm({
    resolver: zodResolver(slaSchema),
    defaultValues: {
      leave_type_uuid: defaultLeaveTypeUuid ?? "",
      sla: 0,
    },
  });

  const leaveTypeUuid = watch("leave_type_uuid");

  useEffect(() => {
    if (open) {
      reset({
        leave_type_uuid: defaultLeaveTypeUuid ?? "",
        sla: getExistingSla(defaultLeaveTypeUuid ?? ""),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultLeaveTypeUuid]);

  // userLeaveTypes loads asynchronously after the modal opens — once it
  // arrives, backfill the existing SLA for the still-selected default type.
  useEffect(() => {
    if (open && leaveTypeUuid && leaveTypeUuid === defaultLeaveTypeUuid) {
      setValue("sla", getExistingSla(leaveTypeUuid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLeaveTypes]);

  const handleClose = () => {
    reset();
    onOpenChange(false);
    onClose?.();
  };

  const onSubmit = async (data: SlaFormValues) => {
    if (!org_uuid) {
      toastError("Organization ID is missing");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        org_uuid,
        user_uuid: selectedUserUuid,
        period,
        ...data,
      };
      await dispatch(allocateSpecialLeaveAction(payload)).unwrap();
      await onResolve?.();
      handleClose();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Provide SLA Allocation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="leave_type_uuid"
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1">
                <FieldLabel>Leave Type</FieldLabel>

                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("sla", getExistingSla(value));
                  }}
                >
                  <SelectTrigger className="w-full">
                    {leaveTypesLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Loading leave types...
                      </div>
                    ) : (
                      <SelectValue placeholder="Select leave type" />
                    )}
                  </SelectTrigger>

                  <SelectContent>
                    {userLeaveTypes?.map((leave) => (
                      <SelectItem key={leave.uuid} value={leave.uuid}>
                        {leave.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError errors={[fieldState.error]} className="text-xs" />
              </Field>
            )}
          />

          <Controller
            name="sla"
            control={control}
            render={({ field, fieldState }) => (
              <Field className="gap-1">
                <FieldLabel>Special SLA Days</FieldLabel>
                <Input
                  // While leave types are (re)loading, the prefilled value
                  // still reflects the previous selection's data — hide it
                  // rather than flash a stale SLA count.
                  value={leaveTypesLoading ? "" : field.value}
                  onChange={(val) => field.onChange(Number(val.target.value))}
                  type="number"
                  step="0.25"
                  placeholder={
                    leaveTypesLoading
                      ? "Calculating existing SLA…"
                      : "New total SLA days (e.g. 5)"
                  }
                  disabled={isSubmitting || leaveTypesLoading}
                />
                <FieldError errors={[fieldState.error]} className="text-xs" />
              </Field>
            )}
          />

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Save Allocation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
