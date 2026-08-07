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
import { listUserLeaveTypesAction } from "@/features/user/list-user-leave-types/list-user-leave-types.action";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { DialogClose } from "@radix-ui/react-dialog";

interface ProvideSlaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUserUuid: string;
  period: string;
  onResolve?: () => Promise<void>;
  onClose?: () => void;
}
export function ProvideSlaModal({
  open,
  onOpenChange,
  selectedUserUuid,
  onClose,
  onResolve,
  period,
}: ProvideSlaModalProps) {
  const dispatch = useAppDispatch();
  const { currentUser, usersLeaveTypes, isLoading } = useAppSelector(
    (state) => state.userSlice,
  );
  const org_uuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUserLeaves = async () => {
    await dispatch(
      listUserLeaveTypesAction({
        org_uuid,
        user_uuid: selectedUserUuid,
        role_uuid: currentUser.role.uuid,
      }),
    );
  };

  useEffect(() => {
    if (open && org_uuid && selectedUserUuid) fetchUserLeaves();
  }, [open, org_uuid, selectedUserUuid]);

  const { handleSubmit, reset, control } = useForm({
    resolver: zodResolver(slaSchema),
    defaultValues: {
      leave_type_uuid: "",
      sla: 0,
    },
  });

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
      toastSuccess("SLA allocated successfully");
      handleClose();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-106">
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

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Loading leave types...
                      </div>
                    ) : (
                      <SelectValue placeholder="Select leave type" />
                    )}
                  </SelectTrigger>

                  <SelectContent>
                    {usersLeaveTypes?.map((leave) => (
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
                  value={field.value}
                  onChange={(val) => field.onChange(Number(val.target.value))}
                  type="number"
                  step="0.25"
                  placeholder="Enter SLA value (e.g. 5)"
                  disabled={isSubmitting}
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
