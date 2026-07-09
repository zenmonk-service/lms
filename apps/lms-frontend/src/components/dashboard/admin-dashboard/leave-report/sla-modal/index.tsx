"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { LeaveBalance } from "@/features/leave/leave.types";
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
import { listUserAction } from "@/features/user/list-user/list-user.action";
import { UserInterface } from "@/features/user/user.type";

interface ProvideSlaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveBalance: LeaveBalance[];
  month: string;
  setSelectedLeaveBalance: React.Dispatch<
    React.SetStateAction<UserInterface | null>
  >;
}
export function ProvideSlaModal({
  open,
  onOpenChange,
  leaveBalance,
  setSelectedLeaveBalance,
  month
}: ProvideSlaModalProps) {
  const dispatch = useAppDispatch();

  const currentOrganizationUuid = useAppSelector(
    (state) => state.organizationsSlice.currentOrganization?.uuid,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(slaSchema),
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
    setSelectedLeaveBalance(null);
  };

  const onSubmit = async (data: SlaFormValues) => {
    if (!currentOrganizationUuid) {
      toast.error("Organization ID is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        allocateSpecialLeaveAction({
          org_uuid: currentOrganizationUuid,
          leave_balance_uuid: data.leave_balance_uuid,
          sla: data.sla,
        }),
      ).unwrap();

      toast.success("SLA allocated successfully");

      dispatch(
        listUserAction({
          org_uuid: currentOrganizationUuid,
          pagination: {page: 1, limit: 10},
          month,
        }),
      );
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to allocate SLA");
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <Field className="w-full mb-4">
            <FieldLabel className="text-xs font-semibold text-muted-foreground">
              Leave Type
            </FieldLabel>

            <Select
              value={watch("leave_balance_uuid")}
              onValueChange={(value) => setValue("leave_balance_uuid", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>

              <SelectContent>
                {leaveBalance?.map((leave) => (
                  <SelectItem key={leave.uuid} value={leave.uuid}>
                    {leave.leave_type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FieldError errors={[errors.leave_balance_uuid]} />
          </Field>
          <Field>
            <FieldLabel className="text-xs font-semibold text-muted-foreground">
              Special SLA Days
            </FieldLabel>
            <div className="relative">
              <Input
                type="number"
                step="any"
                placeholder="Enter SLA value (e.g. 5)"
                className="pr-10 dark:bg-input/10"
                disabled={isSubmitting}
                {...register("sla")}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-xs">
                Days
              </div>
            </div>
            <FieldError errors={[errors.sla]} />
          </Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
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
