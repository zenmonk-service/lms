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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LeaveBalance } from "@/features/leave/leave.types";
import { useAppDispatch, useAppSelector } from "@/store";
import { allocateSpecialLeaveAction } from "@/features/leave/allocate-special-leave/allocate-special-leave.action";
import { listUserLeaveBalancesAction } from "@/features/leave/list-user-leave-balance/list-user-leave-balance.action";
import { SlaFormValues, slaSchema } from "@/components/leave/leave.types";

interface ProvideSlaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveBalance: LeaveBalance | null;
  userUUId?: string;
  defaultSla?: number;
}

export function ProvideSlaModal({
  open,
  onOpenChange,
  leaveBalance,
  userUUId,
}: ProvideSlaModalProps) {
  const dispatch = useAppDispatch();
  
  const { currentUser } = useAppSelector((state) => state.userSlice);
  const currentOrganizationUuid = useAppSelector((state) => state.organizationsSlice.currentOrganization?.uuid);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(slaSchema),
    defaultValues: {
      sla: leaveBalance?.sla ? Number.parseInt(leaveBalance.sla) : 0,
    },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  }

  const onSubmit = async (data: SlaFormValues) => {
    if (!leaveBalance?.uuid) {
      toast.error("Leave balance UUID is missing");
      return;
    }
    if (!currentOrganizationUuid) {
      toast.error("Organization ID is missing");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        allocateSpecialLeaveAction({
          org_uuid: currentOrganizationUuid,
          leave_balance_uuid: leaveBalance.uuid,
          sla: data.sla,
        }),
      ).unwrap();

      toast.success("SLA allocated successfully");

      // Reload leave balances
      dispatch(
        listUserLeaveBalancesAction({
          user_uuid: userUUId || currentUser?.user_id,
          org_uuid: currentOrganizationUuid,
          period: leaveBalance.period,
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
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Provide SLA Allocation</DialogTitle>
          <DialogDescription>
            Assign special leave allocation for{" "}
            <span className="font-semibold text-foreground">
              {leaveBalance?.leave_type?.name}
            </span>{" "}
            ({leaveBalance?.leave_type?.code}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
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
